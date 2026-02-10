// Base URL for Modal functions - to be updated after deployment
const MODAL_BASE_URL = process.env.NEXT_PUBLIC_MODAL_BASE_URL || 'https://example-modal-url.modal.run'

export async function triggerN8NWorkflow(payload: Record<string, unknown>) {
    try {
        const response = await fetch(`${MODAL_BASE_URL}/trigger_n8n_workflow`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            throw new Error(`Modal error: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Failed to trigger n8n workflow:', error)
        throw error
    }
}

export async function updateAgentStatus(agentName: string, status: string) {
    try {
        const response = await fetch(`${MODAL_BASE_URL}/update_agent_status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ agent_name: agentName, status }),
        })

        if (!response.ok) {
            throw new Error(`Modal error: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Failed to update agent status:', error)
        throw error
    }
}
