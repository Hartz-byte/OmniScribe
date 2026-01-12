import os
from huggingface_hub import snapshot_download
from faster_whisper import WhisperModel
from paddleocr import PaddleOCR

# 1. Define the target directory
BASE_MODEL_PATH = r"D:\AIML-Projects\OmniScribe\models"
os.makedirs(BASE_MODEL_PATH, exist_ok=True)

def download_all():
    print(f"🚀 Starting model downloads to: {BASE_MODEL_PATH}")

    # --- A. Download Embedding Model (BGE-Small-En) ---
    # We use snapshot_download to force it into our D: drive folder
    print("\n--- 1/3 Downloading Embedding Model (BGE-Small-En) ---")
    embedding_path = os.path.join(BASE_MODEL_PATH, "bge-small-en")
    snapshot_download(
        repo_id="BAAI/bge-small-en-v1.5",
        local_dir=embedding_path,
        local_dir_use_symlinks=False
    )
    print(f"✅ Embedding model saved to {embedding_path}")

    # --- B. Download Faster-Whisper (Small-v3) ---
    # 'small' is the best balance for 4GB VRAM. 
    print("\n--- 2/3 Downloading Faster-Whisper Model ---")
    whisper_path = os.path.join(BASE_MODEL_PATH, "whisper-small")
    # We trigger the download by initializing the model with a download_root
    WhisperModel("small", device="cpu", download_root=whisper_path)
    print(f"✅ Whisper model saved to {whisper_path}")

    # --- C. Download PaddleOCR (PP-OCRv4) ---
    # PaddleOCR downloads three models: Detection, Recognition, and Classification
    print("\n--- 3/3 Downloading PaddleOCR Models ---")
    # Setting this env variable tells Paddle where to store models
    os.environ["BASE_MODEL_PATH"] = BASE_MODEL_PATH 
    # Initialize PaddleOCR; it will auto-download to the default cache first, 
    # but we will move/point to it in the final app.
    ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
    print("✅ PaddleOCR default models initialized.")

    print("\n✨ All models are ready in your D: drive!")

if __name__ == "__main__":
    download_all()
