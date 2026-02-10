import modal
from typing import Dict, Any

app = modal.App("openclaw-dashboard")

image = (
    modal.Image.debian_slim()
    .pip_install("requests", "supabase")
)

@app.function(image=image, secrets=[modal.Secret.from_name("supabase-secrets")])
@modal.web_endpoint(method="POST")
def trigger_n8n_workflow(payload: Dict[str, Any]):
    import requests
    import os
    
    # In a real scenario, this URL would come from environment variables or database configuration
    # For now, we'll use a placeholder or check payload for webhook_url
    webhook_url = payload.get("webhook_url") or os.environ.get("N8N_WEBHOOK_URL")
    
    if not webhook_url:
        return {"error": "No webhook URL provided", "status": 400}
        
    try:
        response = requests.post(webhook_url, json=payload.get("data", {}))
        return {
            "success": response.ok,
            "status": response.status_code,
            "data": response.json() if response.headers.get("content-type") == "application/json" else response.text
        }
    except Exception as e:
        return {"error": str(e), "status": 500}

@app.function(image=image, secrets=[modal.Secret.from_name("supabase-secrets")])
@modal.web_endpoint(method="POST")
def update_agent_status(payload: Dict[str, Any]):
    from supabase import create_client, Client
    import os
    
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    if not url or not key:
        return {"error": "Missing Supabase credentials", "status": 500}
        
    supabase: Client = create_client(url, key)
    
    agent_name = payload.get("agent_name")
    new_status = payload.get("status")
    
    if not agent_name or not new_status:
        return {"error": "Missing agent_name or status", "status": 400}
        
    try:
        # Update the status in the agents table
        data, count = supabase.table("[OpenClaw] Dashboard - Agents").update({"status": new_status}).eq("name", agent_name).execute()
        
        return {"success": True, "data": data}
    except Exception as e:
        return {"error": str(e), "status": 500}

@app.function(image=image)
@modal.web_endpoint(method="GET")
def health_check():
    return {"status": "healthy", "service": "openclaw-modal-engine"}
