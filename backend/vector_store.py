import config
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

# Global variable to hold the singleton instance
_db_instance = None

def get_vector_store():
    global _db_instance
    
    # Return existing instance if created (Singleton Pattern)
    if _db_instance is not None:
        return _db_instance

    print("🔌 Connecting to Vector Database...")
    
    # Initialize Local Embeddings (Running on CPU)
    embeddings = HuggingFaceEmbeddings(
        model_name=config.EMBEDDING_MODEL_PATH,
        model_kwargs={'device': config.EMBEDDING_DEVICE},
        encode_kwargs={'normalize_embeddings': True}
    )

    # Connect to ChromaDB
    _db_instance = Chroma(
        persist_directory=config.VECTOR_DB_PATH,
        embedding_function=embeddings,
        collection_name=config.COLLECTION_NAME
    )
    
    print("✅ Vector Database Connected.")
    return _db_instance
