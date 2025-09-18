from flask import Flask, request, jsonify, send_file
from langchain_ollama import ChatOllama
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
import os
import ollama
from fpdf import FPDF
from flask_cors import CORS
import collections
collections.Iterable = collections.abc.Iterable

app = Flask(__name__)
CORS(app)

# ---- CNN Classifier ----
class TumorClassifier(nn.Module):
    def __init__(self, num_classes):
        super(TumorClassifier, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(3, 16, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        self.classifier = nn.Sequential(
            nn.Linear(32 * 56 * 56, 128),
            nn.ReLU(inplace=True),
            nn.Linear(128, num_classes)
        )

    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        x = self.classifier(x)
        return x

# Load trained model
model = TumorClassifier(num_classes=4)
model.load_state_dict(torch.load("./Model/best_model.pth", map_location='cpu'))
model.eval()

class_name = {0:"glioma_tumor", 1:"meningioma_tumor", 2:"no_tumor", 3:"pituitary_tumor"}

# ---- Flask Endpoint ----
@app.route('/classify', methods=['POST'])
def classify():
    try:
        file = request.files['file']
        print(f"Received file: {file.filename}")
        file_path = os.path.join("./", file.filename)
        file.save(file_path)

        transform = transforms.Compose([
            transforms.Resize((224,224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225])
        ])
        image = Image.open(file_path).convert("RGB")
        input_tensor = transform(image).unsqueeze(0)

        # CNN Prediction
        with torch.no_grad():
            output = model(input_tensor)
        _, predicted_class = torch.max(output, 1)
        predicted_class_idx = predicted_class.item()
        prediction = class_name[predicted_class_idx]

        # LLM Analysis
        prompt = f"""
        The MRI classifier detected: {prediction}.

        Task:
        1. Explain what this condition is in medical terms.
        2. Highlight possible abnormalities linked to it.
        3. Suggest treatments or next medical steps.
        4. Make it suitable for inclusion in a medical report.
        """

        response = ollama.chat(
            model="alibayram/medgemma",
            messages=[{"role": "user", "content": prompt}]
        )
        llm_output = response['message']['content']

        # ---- PDF Report ----
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="Brain MRI Report", ln=True, align="C")
        pdf.ln(10)
        pdf.multi_cell(0, 10, f"Prediction: {prediction}\n\nAI Analysis:\n{llm_output}")
        
        report_path = "report.pdf"
        pdf.output(report_path)

        # Cleanup uploaded image
        os.remove(file_path)

        # return send_file(report_path, as_attachment=True)
        return jsonify({"prediction": prediction, "analysis": llm_output})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True,port=3001)