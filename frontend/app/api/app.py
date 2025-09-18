# ---- Patch before model import ----
from typing import List

import torch
from PIL import Image
from transformers import AutoModel, AutoTokenizer, BitsAndBytesConfig
from huggingface_hub import login
import os
login(token=os.getenv("HF_TOKEN"))

model_id = "ContactDoctor/Bio-Medical-MultiModal-Llama-3-8B-V1"

model = AutoModel.from_pretrained(
    model_id,
    trust_remote_code=True,
    device_map="auto",
    torch_dtype=torch.float16,
    # quantization_config=quant_config,   # uncomment for 4-bit quantization
)

tokenizer = AutoTokenizer.from_pretrained(
    model_id,
    trust_remote_code=True
)

# Load image
image = Image.open("image.png").convert("RGB")

# Ask question
question = """
You are a medical AI model trained to classify brain MRI scans.
Possible classes: ["no_tumor", "pituitary_tumor", "meningioma_tumor", "glioma_tumor"]

Task:
1. Look at the given MRI image.
2. Output ONLY one of the class names (no extra text).
"""

msgs = [{'role': 'user', 'content': [image, question]}]
res = model.chat(image=image, msgs=msgs, tokenizer=tokenizer, sampling=True, temperature=0.95, stream=True)

generated_text = ""
for new_text in res:
    generated_text += new_text
    print(new_text, flush=True, end="")

print("\n\nFinal output:", generated_text)
