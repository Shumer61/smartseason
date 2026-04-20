import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import FieldCard from '../components/FieldCard'
import FieldForm from '../components/FieldForm'
import AssignField from '../components/AssignField'

function AdminDashboard() {
    const { user, token, logout } = useAuth()
    const [fields, setFields] = useState([])
    const [summary, setSummary] = useState(null)
    const [showFieldForm, setShowFieldForm] = useState(false)
    const [showAssignForm, setShowAssignForm] = useState(false)

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

    const handleFieldCreated = (newField) => {
        setFields(prev => [...prev, newField])
        fetchSummary()
        setShowFieldForm(false)
    }

    const handleAssigned = (updatedField) => {
        setFields(prev => prev.map(f =>
            f._id === updatedField._id ? updatedField : f
        ))
        setShowAssignForm(false)
    }

    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/fields/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            })
            if(response.ok) {
                setFields(prev => prev.filter(f => f._id !== id))
                fetchSummary()
            }
        } catch(error) {
            console.log('Error deleting field:', error)
        }
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1>SmartSeason</h1>
                <div className="header-right">
                    <span>Admin — {user.name}</span>
                    <button onClick={logout} className="logout-btn">Logout</button>
                </div>
            </div>

            {summary && (
                <div className="summary-cards">
                    <div className="summary-card">
                        <h3>{summary.total}</h3>
                        <p>Total Fields</p>
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

            <div className="dashboard-actions">
                <button onClick={() => setShowFieldForm(!showFieldForm)}>
                    {showFieldForm ? 'Cancel' : '+ Add Field'}
                </button>
                <button onClick={() => setShowAssignForm(!showAssignForm)}>
                    {showAssignForm ? 'Cancel' : 'Assign Field'}
                </button>
            </div>

            {showFieldForm && (
                <FieldForm token={token} onFieldCreated={handleFieldCreated} />
            )}

            {showAssignForm && (
                <AssignField token={token} fields={fields} onAssigned={handleAssigned} />
            )}

            <div className="fields-grid">
                {fields.length === 0
                    ? <p className="empty-state">No fields yet. Add one above.</p>
                    : fields.map(field => (
                        <FieldCard
                            key={field._id}
                            field={field}
                            isAgent={false}
                            onDelete={handleDelete}
                        />
                    ))
                }
            </div>
        </div>
    )
}

export default AdminDashboard