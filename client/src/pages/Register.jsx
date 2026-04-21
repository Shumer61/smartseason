import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function Register({ onSwitch }) {
    const { login } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('agent')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role })
            })

            const data = await response.json()

            if(!response.ok) {
                setError(data.message)
                setLoading(false)
                return
            }

            login({
                _id: data._id,
                name: data.name,
                email: data.email,
                role: data.role
            }, data.token)

        } catch(err) {
            setError('Something went wrong')
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>SmartSeason</h1>
                <h2>Create an account</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="off"
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="off"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="agent">Field Agent</option>
                        <option value="admin">Admin</option>
                    </select>
                    {error && <p className="error">{error}</p>}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
                <p className="auth-switch">
                    Already have an account?{' '}
                    <span onClick={onSwitch}>Login</span>
                </p>
            </div>
        </div>
    )
}

export default Register