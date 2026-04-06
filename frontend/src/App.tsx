import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import UserManagement from './pages/UserManagement'
import UserForm from './pages/UserForm'
import Profile from './pages/Profile'

import ConsentedApps from './pages/ConsentedApps'
import Consent from './pages/Consent'

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-slate-50">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/user" element={<UserManagement />} />
                    <Route path="/user/add" element={<UserForm />} />
                    <Route path="/consented-apps" element={<ConsentedApps />} />
                    <Route path="/oauth2/consent" element={<Consent />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
