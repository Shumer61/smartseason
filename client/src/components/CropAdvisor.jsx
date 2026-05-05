import { useState } from 'react'

function CropAdvisor({ field, onClose }) {
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
You are an agricultural field advisor. A field agent has provided the following information:

Field Name: ${field.name}
Crop Type: ${field.cropType}
Planting Date: ${new Date(field.plantingDate).toLocaleDateString()}
Current Stage: ${field.stage}
Current Status: ${field.status}

Agent Observation: ${observation}

Based on this information provide structured advice in the following JSON format only, no extra text:
{
  "assessment": "one sentence summary of the situation",
  "issue": "what is likely wrong or what to watch for",
  "action": "specific steps the agent should take",
  "urgency": "Low or Medium or High"
}
`

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            )

            const data = await response.json()
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text

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
            console.log(err)
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