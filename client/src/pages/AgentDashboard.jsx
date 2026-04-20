import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import FieldCard from '../components/FieldCard'
import UpdateStageForm from '../components/UpdateStageForm'

function AgentDashboard() {
    const { user, token, logout } = useAuth()
    const [fields, setFields] = useState([])
    const [summary, setSummary] = useState(null)
    const [selectedField, setSelectedField] = useState(null)

    useEffect(() => {
        fetchFields()
        fetchSummary()
    }, [])

    const fetchFields = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/fields`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            if(response.ok) setFields(data)
        } catch(error) {
            console.log('Error fetching fields:', error)
        }
    }

    const fetchSummary = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            if(response.ok) setSummary(data)
        } catch(error) {
            console.log('Error fetching summary:', error)
        }
    }

    const handleUpdated = (updatedField) => {
        setFields(prev => prev.map(f =>
            f._id === updatedField._id ? updatedField : f
        ))
        fetchSummary()
        setSelectedField(null)
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>SmartSeason</h1>
                <div className="header-right">
                    <span>Agent — {user.name}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </div>

            {summary && (
                <div className="summary-cards">
                    <div className="summary-card">
                        <h3>{summary.total}</h3>
                        <p>My Fields</p>
                    </div>
                    <div className="summary-card active">
                        <h3>{summary.byStatus.Active}</h3>
                        <p>Active</p>
                    </div>
                    <div className="summary-card risk">
                        <h3>{summary.byStatus.AtRisk}</h3>
                        <p>At Risk</p>
                    </div>
                    <div className="summary-card completed">
                        <h3>{summary.byStatus.Completed}</h3>
                        <p>Completed</p>
                    </div>
                </div>
            )}

            <div className="fields-grid">
                {fields.length === 0
                    ? <p>No fields assigned to you yet.</p>
                    : fields.map(field => (
                        <FieldCard
                            key={field._id}
                            field={field}
                            isAgent={true}
                            onUpdate={setSelectedField}
                        />
                    ))
                }
            </div>

            {selectedField && (
                <UpdateStageForm
                    field={selectedField}
                    token={token}
                    onUpdated={handleUpdated}
                    onClose={() => setSelectedField(null)}
                />
            )}
        </div>
    )
}

export default AgentDashboard