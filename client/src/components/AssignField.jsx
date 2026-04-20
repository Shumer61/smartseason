import { useState, useEffect } from 'react'

function AssignField({ token, fields, onAssigned }) {
    const [agents, setAgents] = useState([])
    const [selectedField, setSelectedField] = useState('')
    const [selectedAgent, setSelectedAgent] = useState('')

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/agents`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await response.json()
                if(response.ok) setAgents(data)
            } catch(error) {
                console.log('Error fetching agents:', error)
            }
        }
        fetchAgents()
    }, [token])

    const handleAssign = async () => {
        if(!selectedField || !selectedAgent) return

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/fields/${selectedField}/assign`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ agentId: selectedAgent })
                }
            )
            const data = await response.json()
            if(response.ok) {
                onAssigned(data)
                setSelectedField('')
                setSelectedAgent('')
            }
        } catch(error) {
            console.log('Error assigning field:', error)
        }
    }

    return (
        <div className="assign-form">
            <h3>Assign Field to Agent</h3>
            <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
                <option value="">Select field</option>
                {fields.map(field => (
                    <option key={field._id} value={field._id}>{field.name}</option>
                ))}
            </select>
            <select value={selectedAgent} onChange={(e) => setSelectedAgent(e.target.value)}>
                <option value="">Select agent</option>
                {agents.map(agent => (
                    <option key={agent._id} value={agent._id}>{agent.name}</option>
                ))}
            </select>
            <button onClick={handleAssign}>Assign</button>
        </div>
    )
}

export default AssignField