import os
import shutil
import tarfile
import time
import requests
from huggingface_hub import snapshot_download

# CONFIGURATION
BASE_MODEL_PATH = r"D:\AIML-Projects\OmniScribe\models"
EMBED_PATH = os.path.join(BASE_MODEL_PATH, "bge-small-en")
WHISPER_PATH = os.path.join(BASE_MODEL_PATH, "whisper-small")
OCR_PATH = os.path.join(BASE_MODEL_PATH, "paddleocr")

# Ensure base directories exist
os.makedirs(BASE_MODEL_PATH, exist_ok=True)
os.makedirs(OCR_PATH, exist_ok=True)
os.makedirs(WHISPER_PATH, exist_ok=True)

def download_file_http(url, save_path, retries=3):
    """Robust file downloader with retries and headers."""
    filename = os.path.basename(save_path)
    print(f"   ⬇️  Downloading {filename}...")
    
    if os.path.exists(save_path) and os.path.getsize(save_path) > 1000:
        print("       (File exists, skipping)")
        return True

    headers = {'User-Agent': 'Mozilla/5.0'}
    
    for attempt in range(retries):
        try:
            with requests.get(url, stream=True, headers=headers, timeout=60) as r:
                r.raise_for_status()
                with open(save_path, 'wb') as f:
                    for chunk in r.iter_content(chunk_size=8192):
                        f.write(chunk)
            print("       ✅ Success")
            return True
        except Exception as e:
            print(f"       ⚠️ Attempt {attempt+1} failed: {e}")
            time.sleep(2)
    return False

def extract_tar(tar_path, extract_path):
    """Extracts tarball and cleans up."""
    try:
        print(f"   📦 Extracting {os.path.basename(tar_path)}...")
        with tarfile.open(tar_path, "r") as tar:
            tar.extractall(path=extract_path)
        # Optional: os.remove(tar_path)
    except Exception as e:
        print(f"   ❌ Extraction Failed: {e}")

# EMBEDDINGS
def setup_embeddings():
    print(f"\n🔹 [1/3] Setting up Embedding Model (BGE-Small-En)...")
    try:
        snapshot_download(
            repo_id="BAAI/bge-small-en-v1.5",
            local_dir=EMBED_PATH,
            local_dir_use_symlinks=False
        )
        print("   ✅ Embeddings Ready.")
    except Exception as e:
        print(f"   ❌ Embeddings Failed: {e}")

# WHISPER (Manual Force Download)
def setup_whisper():
    print(f"\n🔹 [2/3] Setting up Faster-Whisper (Small)...")
    
    # Official Raw URLs (Bypassing internal logic to ensure model.bin exists)
    files = {
        "config.json": "https://huggingface.co/Systran/faster-whisper-small/resolve/main/config.json",
        "model.bin": "https://huggingface.co/Systran/faster-whisper-small/resolve/main/model.bin",
        "tokenizer.json": "https://huggingface.co/Systran/faster-whisper-small/resolve/main/tokenizer.json",
        "vocabulary.txt": "https://huggingface.co/Systran/faster-whisper-small/resolve/main/vocabulary.txt"
    }

    success = True
    for fname, url in files.items():
        if not download_file_http(url, os.path.join(WHISPER_PATH, fname)):
            success = False
    
    if success:
        print("   ✅ Whisper Ready.")
    else:
        print("   ❌ Whisper Setup Incomplete.")

# PADDLE OCR (Manual V4 Download)
def setup_paddleocr():
    print(f"\n🔹 [3/3] Setting up PaddleOCR (v4)...")
    
    # Note: 'det' uses Chinese model (ch) because it works for all languages (general detection)
    urls = {
        "det.tar": "https://paddleocr.bj.bcebos.com/PP-OCRv4/chinese/ch_PP-OCRv4_det_infer.tar",
        "rec.tar": "https://paddleocr.bj.bcebos.com/PP-OCRv4/english/en_PP-OCRv4_rec_infer.tar",
        "cls.tar": "https://paddleocr.bj.bcebos.com/dygraph_v2.0/ch/ch_ppocr_mobile_v2.0_cls_infer.tar"
    }

    for fname, url in urls.items():
        tar_path = os.path.join(OCR_PATH, fname)
        if download_file_http(url, tar_path):
            extract_tar(tar_path, OCR_PATH)
    
    print("   ✅ PaddleOCR Ready.")

if __name__ == "__main__":
    print(f"🚀 STARTING OMNI-SCRIBE MODEL SETUP")
    print(f"📂 Target: {BASE_MODEL_PATH}")
    
    setup_embeddings()
    setup_whisper()
    setup_paddleocr()
    
    print("\n✨ ALL TASKS COMPLETED. You can now run 'python main.py'")
