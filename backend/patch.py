import sys
import types
import logging

def apply_langchain_patch():
    """
    Monkeys patches the missing legacy LangChain modules required by PaddleOCR.
    This enables PaddleOCR to run alongside LangGraph/LangChain v0.3+.
    """
    try:
        # Patch 'langchain.docstore.document'
        if "langchain.docstore.document" not in sys.modules:
            import langchain_core.documents
            m_docstore = types.ModuleType("langchain.docstore.document")
            m_docstore.Document = langchain_core.documents.Document
            sys.modules["langchain.docstore.document"] = m_docstore

        # Patch 'langchain.text_splitter'
        if "langchain.text_splitter" not in sys.modules:
            import langchain_text_splitters
            m_text_splitter = types.ModuleType("langchain.text_splitter")
            m_text_splitter.RecursiveCharacterTextSplitter = langchain_text_splitters.RecursiveCharacterTextSplitter
            sys.modules["langchain.text_splitter"] = m_text_splitter
            
        logging.info("✅ Applied LangChain Compatibility Patch.")
    except Exception as e:
        logging.warning(f"⚠️ Failed to apply patch: {e}")
