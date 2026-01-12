import torch
import paddle
from faster_whisper import WhisperModel

def check_system():
    print("--- OMNI-SCRIBE GPU DIAGNOSTICS ---")
    
    # 1. Check PyTorch (Used by Embeddings/General ML)
    torch_gpu = torch.cuda.is_available()
    print(f"✅ PyTorch GPU Available: {torch_gpu}")
    if torch_gpu:
        print(f"   Device: {torch.cuda.get_device_name(0)}")
        print(f"   VRAM: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")

    # 2. Check PaddlePaddle (Used by PaddleOCR)
    paddle.utils.run_check()
    print(f"✅ PaddlePaddle GPU Detected: {paddle.device.get_device()}")

    # 3. Check Faster-Whisper (Used for Audio)
    # We try to load a tiny model to see if it accepts 'cuda' without crashing
    try:
        print("🔄 Testing Whisper GPU Load...")
        # compute_type="int8" is CRITICAL for your 4GB VRAM
        model = WhisperModel("tiny", device="cuda", compute_type="int8")
        print("✅ Faster-Whisper loaded successfully on CUDA (int8)")
    except Exception as e:
        print(f"❌ Whisper Error: {e}")

if __name__ == "__main__":
    check_system()
