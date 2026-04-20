import { useState } from 'react'

function UpdateStageForm({ field, token, onUpdated, onClose }) {
    const [stage, setStage] = useState(field.stage)
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/fields/${field._id}/update`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ stage, note })
                }
            )
            const data = await response.json()
            if(response.ok) {
                onUpdated(data)
                onClose()
            }
        } catch(error) {
            console.log('Error updating field:', error)
        }

        setLoading(false)
    }

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h3>Update {field.name}</h3>
                <form onSubmit={handleSubmit}>
                    <select value={stage} onChange={(e) => setStage(e.target.value)}>
                        <option value="Planted">Planted</option>
                        <option value="Growing">Growing</option>
                        <option value="Ready">Ready</option>
                        <option value="Harvested">Harvested</option>
                    </select>
                    <textarea
                        placeholder="Add a note or observation..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                    />
                    <div className="modal-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Update'}
                        </button>
                        <button type="button" onClick={onClose}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default UpdateStageForm