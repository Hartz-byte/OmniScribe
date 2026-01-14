import config
import re
from typing import TypedDict, List, Annotated
from langchain_ollama import ChatOllama
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, END
from langchain_community.tools.tavily_search import TavilySearchResults
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
    temperature=0.0, # Zero temp for strict instruction following
    keep_alive="5m"
)

# Nodes

def retrieve_node(state: AgentState):
    """Fetches top-k relevant documents from ChromaDB."""
    query = state['query']
    print(f"🔍 Searching memory for: {query}")
    
    vector_db = get_vector_store()
    
    # Increase k to ensure coverage
    docs = vector_db.similarity_search(query, k=5)
    context_data = [d.page_content for d in docs]
    
    # Log only count
    print(f"📄 Found {len(context_data)} chunks.")
    return {"context": context_data}

def grade_and_generate_node(state: AgentState):
    # 1. Label context with strict IDs (internal use only - not shown to user)
    context_with_ids = []
    for i, txt in enumerate(state['context']):
        # Clean text for better LLM parsing
        clean_txt = txt.replace("\n", " ")[:800] 
        context_with_ids.append(f"[Source {i}] {clean_txt}...")
    
    context_str = "\n\n".join(context_with_ids)
    
    # 2. Check if we have already researched (Loop Prevention)
    has_researched = any("[WEB SEARCH RESULT]" in d for d in state['context'])

    # 3. Prompt Construction - Different prompts for web vs local
    if has_researched:
        # More flexible prompt for web search results - ask for context
        prompt = f"""
        You are Omni-Scribe. Answer the user's question using the provided context.
        
        CONTEXT:
        {context_str}
        
        USER QUESTION:
        {state['query']}
        
        INSTRUCTIONS:
        1. Answer the question based on the context provided.
        2. Since this is from web search, provide a brief explanation or context around your answer (1-2 sentences).
        3. Do NOT include any "Source" references or IDs in your answer.
        4. If you truly cannot find any relevant information, say exactly: "INSUFFICIENT_INFO"
        5. At the very end, on a new line, cite which sources you used: SOURCES: [0, 1]
        """
    else:
        # Strict prompt for local memory
        prompt = f"""
        You are Omni-Scribe. Answer the user's question using ONLY the provided context.
        
        CONTEXT:
        {context_str}
        
        USER QUESTION:
        {state['query']}
        
        INSTRUCTIONS:
        1. Answer the question DIRECTLY and CONCISELY.
        2. Do NOT include any "Source" references or IDs in your answer text.
        3. If the answer is NOT clearly in the context, output exactly: "INSUFFICIENT_INFO"
        4. At the very end, on a new line, cite which source you used: SOURCES: [0]
        """
    
    response = llm.invoke([HumanMessage(content=prompt)])
    content = response.content.strip()
    
    # 4. Loop Prevention & Sufficiency Check
    if "INSUFFICIENT_INFO" in content.upper():
        if has_researched:
            # We already tried the web and failed. STOP LOOPING.
            return {
                "response": "I searched my memory and the web, but couldn't find a specific answer to that.", 
                "is_sufficient": True,
                "context": [] # Clear context since nothing was useful
            }
        else:
            # We haven't researched yet. Trigger web search.
            return {
                "response": "Fetching external data...", 
                "is_sufficient": False 
            }
    
    # 5. Source Filtering Logic
    final_response = content
    filtered_context = [] 
    
    match = re.search(r"SOURCES:\s*\[([\d,\s]+)\]", content, re.IGNORECASE)
    if match:
        try:
            ids_str = match.group(1)
            indices = [int(x.strip()) for x in ids_str.split(",") if x.strip().isdigit()]
            
            # Keep ONLY the cited sources
            for idx in indices:
                if 0 <= idx < len(state['context']):
                    filtered_context.append(state['context'][idx])
            
            # Clean the SOURCES tag and any Source ID references from output
            final_response = re.sub(r'\n*SOURCES:\s*\[[\d,\s]+\]', '', content, flags=re.IGNORECASE).strip()
        except:
            # If parsing fails, use most relevant source (first one or web result)
            if has_researched:
                filtered_context = [state['context'][-1]]  # Web result is last
            elif len(state['context']) > 0:
                filtered_context = [state['context'][0]]  # Most relevant is first
    else:
        # No citation found - use smart fallback
        if has_researched:
            # For web searches, show the web result
            filtered_context = [c for c in state['context'] if "[WEB SEARCH RESULT]" in c]
        elif len(state['context']) > 0:
            # For local memory, show only the first (most relevant) source
            filtered_context = [state['context'][0]]
    
    # 6. Clean up any remaining Source ID references from the response
    final_response = re.sub(r'\(?\s*Source\s*(ID)?:?\s*\d+\s*\)?', '', final_response, flags=re.IGNORECASE).strip()
    
    # 7. Label sources for frontend display
    labeled_context = []
    for ctx in filtered_context:
        if "[WEB SEARCH RESULT]" in ctx:
            # Already has web label, just clean it up
            labeled_context.append(ctx)
        else:
            # Add LOCAL label to local sources
            labeled_context.append(f"[LOCAL MEMORY]: {ctx}")

    return {
        "response": final_response, 
        "context": labeled_context, 
        "is_sufficient": True
    }

def research_node(state: AgentState):
    """Fallback to web search."""
    print(f"🌐 Researching web for: {state['query']}")
    try:
        results = web_search_tool.invoke(state['query'])
        # Combine results into one robust chunk
        web_content = "\n".join([f"- {r['content']}" for r in results])
    except Exception as e:
        web_content = f"Web search error: {str(e)}"
    
    # Append as a NEW chunk. It will have the last ID in the next pass.
    new_chunk = f"[WEB SEARCH RESULT]: {web_content}"
    return {"context": state["context"] + [new_chunk]}

# Graph Construction
workflow = StateGraph(AgentState)

workflow.add_node("retrieve", retrieve_node)
workflow.add_node("reason", grade_and_generate_node)
workflow.add_node("research", research_node)

workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "reason")

def check_sufficiency(state):
    if state["is_sufficient"]:
        return END
    return "research"

workflow.add_conditional_edges(
    "reason", 
    check_sufficiency,
    {
        "research": "research",
        END: END
    }
)

workflow.add_edge("research", "reason")

agent_app = workflow.compile()
