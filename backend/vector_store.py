import config
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings

def get_vector_store():
    # Initialize Local Embeddings (Running on CPU)
    embeddings = HuggingFaceEmbeddings(
        model_name=config.EMBEDDING_MODEL_PATH,
        model_kwargs={'device': config.EMBEDDING_DEVICE},
        encode_kwargs={'normalize_embeddings': True}
    )

    # Connect to ChromaDB
    vector_store = Chroma(
        persist_directory=config.VECTOR_DB_PATH,
        embedding_function=embeddings,
        collection_name=config.COLLECTION_NAME
    )
    
    return vector_store
