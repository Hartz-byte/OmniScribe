from typing import TypedDict, List
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
import config
from vector_store import get_vector_store

# State Definition
class AgentState(TypedDict):
    query: str
    context: List[str]
    response: str
    is_sufficient: bool

# Initialization
llm = ChatOllama(
    model=config.LLM_MODEL_NAME,
    base_url=config.OLLAMA_BASE_URL,
    temperature=0.2, # Low temp for factual accuracy
    keep_alive="5m"  # Keep model loaded for 5 mins
)
vector_db = get_vector_store()

# Nodes

def retrieve_node(state: AgentState):
    """Fetches top-k relevant documents from ChromaDB."""
    print(f"🔍 Searching memory for: {state['query']}")
    docs = vector_db.similarity_search(state['query'], k=3)
    context_data = [d.page_content for d in docs]
    return {"context": context_data}

def grade_and_generate_node(state: AgentState):
    """
    Acts as a Reasoner. It looks at the context and decides if it can answer.
    """
    context_str = "\n\n".join(state['context'])
    
    prompt = f"""
    You are Omni-Scribe, a personal knowledge assistant.
    
    CONTEXT FROM MEMORY:
    {context_str}
    
    USER QUESTION:
    {state['query']}
    
    INSTRUCTIONS:
    1. If the context contains the answer, answer the question clearly using ONLY the context.
    2. If the context is empty or irrelevant, strictly say "INSUFFICIENT_INFO".
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    content = response.content
    
    if "INSUFFICIENT_INFO" in content:
        return {"response": "I don't have enough information in my local memory to answer that.", "is_sufficient": False}
    
    return {"response": content, "is_sufficient": True}

# Graph Construction
workflow = StateGraph(AgentState)

workflow.add_node("retrieve", retrieve_node)
workflow.add_node("reason", grade_and_generate_node)

workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "reason")
workflow.add_edge("reason", END)

agent_app = workflow.compile()
