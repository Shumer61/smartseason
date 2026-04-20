function FieldCard({ field, onUpdate, onDelete, isAgent }) {
    const statusColor = {
        'Active': '#22c55e',
        'At Risk': '#f59e0b',
        'Completed': '#6b7280'
    }

    return (
        <div className="field-card">
            <div className="field-header">
                <h3>{field.name}</h3>
                <span
                    className="status-badge"
                    style={{ backgroundColor: statusColor[field.status] }}
                >
                    {field.status}
                </span>
            </div>
            <div className="field-details">
                <p><strong>Crop:</strong> {field.cropType}</p>
                <p><strong>Stage:</strong> {field.stage}</p>
                <p><strong>Planted:</strong> {new Date(field.plantingDate).toLocaleDateString()}</p>
                {field.assignedTo && (
                    <p><strong>Agent:</strong> {field.assignedTo.name}</p>
                )}
            </div>
            {field.notes && field.notes.length > 0 && (
                <div className="field-notes">
                    <strong>Latest note:</strong>
                    <p>{field.notes[field.notes.length - 1].text}</p>
                </div>
            )}
            <div className="card-actions">
                {isAgent && onUpdate && (
                    <button className="update-btn" onClick={() => onUpdate(field)}>
                        Update Field
                    </button>
                )}
                {!isAgent && onDelete && (
                    <button className="delete-btn" onClick={() => onDelete(field._id)}>
                        Delete
                    </button>
                )}
            </div>
        </div>
    )
}

export default FieldCard