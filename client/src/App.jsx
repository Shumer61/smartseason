import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import AgentDashboard from './pages/AgentDashboard'
import './App.css'

function AppContent() {
    const { user } = useAuth()
    const [showRegister, setShowRegister] = useState(false)

    if(!user) {
        return showRegister
            ? <Register onSwitch={() => setShowRegister(false)} />
            : <Login onSwitch={() => setShowRegister(true)} />
    }

    if(user.role === 'admin') return <AdminDashboard />
    return <AgentDashboard />
}

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    )
}

export default App