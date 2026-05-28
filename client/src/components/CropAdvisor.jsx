import { useState } from 'react'

function CropAdvisor({ field, token, onClose }) {
    const [observation, setObservation] = useState('')
    const [advice, setAdvice] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const getAdvice = async () => {
        if(!observation.trim()) return
        setLoading(true)
        setError('')
        setAdvice(null)

        const prompt = `
You are an expert agricultural advisor. Respond ONLY with a valid JSON object that has exactly these keys:
"assessment", "issue", "action", "urgency".
No extra text, no markdown, no explanations.

Example:
Field: Tomato, Observation: Yellow leaves.
Output: {"assessment":"The tomato plant shows signs of nutrient deficiency.","issue":"Likely nitrogen deficiency.","action":"Apply a balanced fertilizer and ensure proper watering.","urgency":"Medium"}

Now answer the following:

Field Name: ${field.name}
Crop Type: ${field.cropType}
Planting Date: ${new Date(field.plantingDate).toLocaleDateString()}
Current Stage: ${field.stage}
Current Status: ${field.status}

Agent Observation: ${observation}
`;

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/advisor`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ prompt })
                }
            )

            if(response.status === 429) {
                setError('Advisor is busy — please try again in a minute')
                setLoading(false)
                return
            }

            if(!response.ok) {
                setError('Could not reach advisor')
                setLoading(false)
                return
            }

            const data = await response.json()
            const raw = data.text

            if(!raw) {
                setError('No response from advisor')
                setLoading(false)
                return
            }

            const clean = raw.replace(/```json|```/g, '').trim()
            const parsed = JSON.parse(clean)
            setAdvice(parsed)

        } catch(err) {
            setError('Could not get advice right now')
            console.warn('advisor request failed', err)
        }

        setLoading(false)
    }

    const urgencyColor = {
        Low: '#22c55e',
        Medium: '#f59e0b',
        High: '#e53e3e'
    }

    return (
        <div className="modal-overlay">
            <div className="modal advisor-modal">
                <h3>AI Crop Advisor — {field.name}</h3>
                <p className="advisor-field-info">
                    {field.cropType} · {field.stage} · {field.status}
                </p>

                <textarea
                    placeholder="Describe what you are observing in the field — leaf colour, growth rate, weather conditions, pest activity, anything unusual..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                    rows={4}
                />

                {error && <p className="error">{error}</p>}

                {advice && (
                    <div className="advice-result">
                        <div className="advice-header">
                            <p className="advice-assessment">{advice.assessment}</p>
                            <span
                                className="urgency-badge"
                                style={{ backgroundColor: urgencyColor[advice.urgency] }}
                            >
                                {advice.urgency} Urgency
                            </span>
                        </div>
                        <div className="advice-section">
                            <strong>Likely Issue</strong>
                            <p>{advice.issue}</p>
                        </div>
                        <div className="advice-section">
                            <strong>Recommended Action</strong>
                            <p>{advice.action}</p>
                        </div>
                    </div>
                )}

                <div className="modal-buttons" style={{ marginTop: '1rem' }}>
                    <button onClick={getAdvice} disabled={loading || !observation.trim()}>
                        {loading ? 'Consulting advisor...' : 'Get Advice'}
                    </button>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    )
}

export default CropAdvisor