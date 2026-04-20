import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AgentDashboard from './pages/AgentDashboard'
import './App.css'

function AppContent() {
    const { user } = useAuth()

    if(!user) return <Login />
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