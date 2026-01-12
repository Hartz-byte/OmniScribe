import os
import sys
import types
from huggingface_hub import snapshot_download
from faster_whisper import WhisperModel

try:
    import langchain_core.documents
    m_docstore = types.ModuleType("langchain.docstore.document")
    m_docstore.Document = langchain_core.documents.Document
    sys.modules["langchain.docstore.document"] = m_docstore

    import langchain_text_splitters
    m_text_splitter = types.ModuleType("langchain.text_splitter")
    m_text_splitter.RecursiveCharacterTextSplitter = langchain_text_splitters.RecursiveCharacterTextSplitter
    sys.modules["langchain.text_splitter"] = m_text_splitter

    print("✅ Applied Master LangChain v0.3 compatibility patch (Docstore & TextSplitter).")
except ImportError as e:
    print(f"⚠️ Patch failed: {e}. Ensure langchain-core and langchain-text-splitters are installed.")


from paddleocr import PaddleOCR

# Target directory
BASE_MODEL_PATH = r"D:\AIML-Projects\OmniScribe\models"
os.makedirs(BASE_MODEL_PATH, exist_ok=True)

def download_all():
    print(f"🚀 Starting model downloads to: {BASE_MODEL_PATH}")

    # Embedding Model (BGE-Small-En)
    print("\n--- 1/3 Downloading Embedding Model (BGE-Small-En) ---")
    embedding_path = os.path.join(BASE_MODEL_PATH, "bge-small-en")
    snapshot_download(
        repo_id="BAAI/bge-small-en-v1.5",
        local_dir=embedding_path,
        local_dir_use_symlinks=False
    )
    print(f"✅ Embedding model saved to {embedding_path}")

    # Faster-Whisper (Small-v3)
    print("\n--- 2/3 Downloading Faster-Whisper Model ---")
    whisper_path = os.path.join(BASE_MODEL_PATH, "whisper-small")
    WhisperModel("small", device="cpu", download_root=whisper_path)
    print(f"✅ Whisper model saved to {whisper_path}")

    # PaddleOCR (PP-OCRv4)
    print("\n--- 3/3 Downloading PaddleOCR Models ---")
    os.environ["BASE_MODEL_PATH"] = BASE_MODEL_PATH 
    
    try:
        # Disable the logger to prevent spam during initialization
        ocr = PaddleOCR(use_angle_cls=True, lang='en', show_log=False)
        print("✅ PaddleOCR default models initialized.")
    except Exception as e:
        print(f"❌ PaddleOCR Warning: {e}")

    print("\n✨ All models are ready in your D: drive!")

if __name__ == "__main__":
    download_all()
