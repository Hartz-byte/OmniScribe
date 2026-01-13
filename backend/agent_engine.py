from typing import TypedDict, List
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langchain_community.tools.tavily_search import TavilySearchResults
import config
from vector_store import get_vector_store

# Web search Tool
web_search_tool = TavilySearchResults(k=3)

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
    temperature=0.2,
    keep_alive="5m"
)

# Nodes
# Retrieve Node
def retrieve_node(state: AgentState):
    """Fetches top-k relevant documents from ChromaDB."""
    query = state['query']
    print(f"🔍 Searching memory for: {query}")
    
    # Get the shared DB instance
    vector_db = get_vector_store()
    
    # Increase k to 5 to catch more context
    docs = vector_db.similarity_search(query, k=5)
    context_data = [d.page_content for d in docs]
    
    # DEBUG: Print what was actually found
    print(f"📄 Found {len(context_data)} chunks.")
    for i, txt in enumerate(context_data[:2]): # Print first 2 chunks
        print(f"   [Chunk {i+1}]: {txt[:100]}...") 
    
    return {"context": context_data}

# Grade and Generate Node
def grade_and_generate_node(state: AgentState):
    context_str = "\n\n".join(state['context'])
    
    prompt = f"""
    You are Omni-Scribe, a personal knowledge assistant.
    
    CONTEXT FROM MEMORY:
    {context_str}
    
    USER QUESTION:
    {state['query']}
    
    INSTRUCTIONS:
    1. Answer the question based ONLY on the context provided.
    2. If the answer is in the context, be detailed.
    3. If the context is empty or strictly irrelevant, say "INSUFFICIENT_INFO".
    """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    content = response.content
    
    if "INSUFFICIENT_INFO" in content:
        return {"response": "I don't have enough information in my local memory to answer that.", "is_sufficient": False}
    
    return {"response": content, "is_sufficient": True}

# Research Node
def research_node(state: AgentState):
    """Fallback to web search if local memory is insufficient."""
    print(f"🌐 Researching web for: {state['query']}")
    results = web_search_tool.invoke(state['query'])
    web_content = "\n".join([r["content"] for r in results])
    return {"context": state["context"] + [f"[WEB SEARCH]: {web_content}"]}

# Graph Construction
workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve_node)
workflow.add_node("reason", grade_and_generate_node)
workflow.add_node("research", research_node)
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "reason")
workflow.add_edge("retrieve", "reason")
workflow.add_edge("reason", END)

def check_sufficiency(state):
    if not state["is_sufficient"]:
        return "research"
    return END

workflow.add_conditional_edges("reason", check_sufficiency)
workflow.add_edge("research", "reason")

agent_app = workflow.compile()
