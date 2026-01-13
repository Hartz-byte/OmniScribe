import os
import config
import logging

try:
    from patch import apply_langchain_patch
    apply_langchain_patch()
except: pass

from faster_whisper import WhisperModel
from paddleocr import PaddleOCR

class IngestionEngine:
    def __init__(self):
        print("⏳ Initializing Ingestion Engine...")
        
        # Load Whisper (CPU Mode)
        self.whisper = WhisperModel(
            config.WHISPER_MODEL_PATH,
            device=config.WHISPER_DEVICE,
            compute_type=config.WHISPER_COMPUTE_TYPE
        )
        print(f"✅ Whisper Loaded ({config.WHISPER_DEVICE})")

        # Load PaddleOCR (CPU Mode)
        logging.getLogger("ppocr").setLevel(logging.ERROR)
        
        det_path = os.path.join(config.OCR_MODEL_DIR, "ch_PP-OCRv4_det_infer")
        rec_path = os.path.join(config.OCR_MODEL_DIR, "en_PP-OCRv4_rec_infer")
        cls_path = os.path.join(config.OCR_MODEL_DIR, "ch_ppocr_mobile_v2.0_cls_infer")

        self.ocr = PaddleOCR(
            use_angle_cls=True,
            lang='en',
            use_gpu=False, 
            show_log=False,
            det_model_dir=det_path,
            rec_model_dir=rec_path,
            cls_model_dir=cls_path
        )
        print("✅ PaddleOCR Loaded (CPU Mode)")

    def transcribe_audio(self, file_path):
        segments, _ = self.whisper.transcribe(file_path, beam_size=5)
        raw_text = " ".join([s.text for s in segments])
        # Semantic Tag
        return f"[AUDIO TRANSCRIPT]: {raw_text}"

    def extract_text_from_image(self, file_path):
        result = self.ocr.ocr(file_path, cls=True)
        text_content = []
        if result and result[0]:
            text_content = [line[1][0] for line in result[0]]
        
        raw_text = "\n".join(text_content)
        # Semantic Tag
        return f"[IMAGE CONTENT]:\n{raw_text}"

ingestion_engine = IngestionEngine()
