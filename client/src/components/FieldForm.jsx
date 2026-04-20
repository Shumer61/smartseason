import { useState } from 'react'

function FieldForm({ token, onFieldCreated }) {
    const [name, setName] = useState('')
    const [cropType, setCropType] = useState('')
    const [plantingDate, setPlantingDate] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/fields`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, cropType, plantingDate })
            })

            const data = await response.json()
            if(response.ok) {
                onFieldCreated(data)
                setName('')
                setCropType('')
                setPlantingDate('')
            }
        } catch(error) {
            console.log('Error creating field:', error)
        }

        setLoading(false)
    }

    return (
        <form className="field-form" onSubmit={handleSubmit}>
            <h3>Add New Field</h3>
            <input
                type="text"
                placeholder="Field name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />
            <input
                type="text"
                placeholder="Crop type"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                required
            />
            <input
                type="date"
                value={plantingDate}
                onChange={(e) => setPlantingDate(e.target.value)}
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Field'}
            </button>
        </form>
    )
}

export default FieldForm