from flask import Flask, request, jsonify
from flask_cors import CORS
from langchain_ollama import ChatOllama
from PIL import Image
import io
import base64
import collections
collections.Iterable = collections.abc.Iterable
import ollama
import base64

app = Flask(__name__)
CORS(app)

# Initialize the Ollama medical model
model = ChatOllama(model="alibayram/medgemma")

def process_image(file):
    """Convert uploaded file to PIL Image"""
    return Image.open(file).convert("RGB")

@app.route("/analyze", methods=["POST"])
def analyze():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    print("Received file:", file)
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        image = process_image(file)
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()

        question = """
        You are a medical AI model trained to accurately classify brain MRI scans to assist in diagnosis.
        Possible classifications are: "no_tumor", "pituitary_tumor", "meningioma_tumor", "glioma_tumor".

        Your critical task is to analyze the provided MRI image and output ONLY the single, most appropriate class name from the list above. Do not include any other words or characters.
        """

        response = ollama.chat(
        model="alibayram/medgemma",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {"type": "image", "image": img_str}
                    ],
                }
            ],
        )
        print("Model response:", response)
        return response['message']['content']

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=3000)