# ---- Patch before model import ----
from typing import List
import torch
from PIL import Image
from transformers import AutoModel, AutoTokenizer
from huggingface_hub import login
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
from fpdf import FPDF
from werkzeug.utils import secure_filename

load_dotenv()

# Flask setup
app = Flask(__name__)
CORS(app)

# Hugging Face login
login(token=os.getenv("HF_TOKEN"))

model_id = "ContactDoctor/Bio-Medical-MultiModal-Llama-3-8B-V1"

# Load model
model = AutoModel.from_pretrained(
    model_id,
    trust_remote_code=True,
    device_map="auto",
    torch_dtype=torch.float16,
)

tokenizer = AutoTokenizer.from_pretrained(model_id, trust_remote_code=True)


def generate_pdf_report(prediction: str, raw_output: str, img_path: str, output_path: str):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Title
    pdf.set_font("Arial", style="B", size=16)
    pdf.cell(200, 10, "Brain MRI Classification Report", ln=True, align="C")
    pdf.ln(10)

    # Prediction
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, f"Predicted Class: {prediction}", ln=True)
    pdf.multi_cell(0, 10, f"Model Output: {raw_output}")
    pdf.ln(10)

    # Add image
    if img_path and os.path.exists(img_path):
        pdf.cell(200, 10, "MRI Scan:", ln=True)
        pdf.image(img_path, x=10, w=100)  # scale image to fit

    # Save PDF
    pdf.output(output_path)


@app.route("/", methods=["POST"])
def classify_mri():
    try:
        file = request.files["file"]
        filename = secure_filename(file.filename)  # ✅ safe filename
        file_path = os.path.join("./", filename)
        file.save(file_path)

        # Load as PIL (required by model.chat)
        image = Image.open(file_path).convert("RGB")

        # Task prompt
        question = """
        You are a medical AI model trained to classify brain MRI scans.
        Possible classes: ["no_tumor", "pituitary_tumor", "meningioma_tumor", "glioma_tumor"]

        Task:
        1. Look at the given MRI image.
        2. Output ONLY one of the class names (no extra text).
        """

        msgs = [{"role": "user", "content": [image, question]}]

        # Run model
        res = model.chat(
            image=image,
            msgs=msgs,
            tokenizer=tokenizer,
            sampling=False,
            temperature=0.0,
            stream=False,
        )

        predicted_text = res.strip().lower()

        # ✅ Extract only valid class
        valid_classes = ["no_tumor", "pituitary_tumor", "meningioma_tumor", "glioma_tumor"]
        prediction = next((cls for cls in valid_classes if cls in predicted_text), "unknown")

        # Generate PDF
        pdf_path = f"./report_{filename}.pdf"
        generate_pdf_report(prediction, predicted_text, file_path, pdf_path)

        # Return PDF file as response
        return send_file(pdf_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3000)