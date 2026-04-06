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
import PersonalInfo from './pages/profile/PersonalInfo'
import EmailAddress from './pages/profile/EmailAddress'
import MobileNumber from './pages/profile/MobileNumber'
import PasswordChange from './pages/profile/PasswordChange'
import GeoFencing from './pages/profile/GeoFencing'
import AllowedIP from './pages/profile/AllowedIP'
import DeviceSignIn from './pages/profile/DeviceSignIn'
import MultifactorAuth from './pages/profile/MultifactorAuth'
import ActiveSession from './pages/profile/ActiveSession'
import ActivityHistory from './pages/profile/ActivityHistory'
import ConnectedApp from './pages/profile/ConnectedApp'
import AppSignIn from './pages/profile/AppSignIn'

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
                    <Route path="/profile" element={<Profile />}>
                        <Route index element={<Navigate to="personal-info" replace />} />
                        <Route path="personal-info" element={<PersonalInfo />} />
                        <Route path="email" element={<EmailAddress />} />
                        <Route path="mobile" element={<MobileNumber />} />
                        <Route path="password" element={<PasswordChange />} />
                        <Route path="geo-fencing" element={<GeoFencing />} />
                        <Route path="allowed-ip" element={<AllowedIP />} />
                        <Route path="device-signin" element={<DeviceSignIn />} />
                        <Route path="mfa" element={<MultifactorAuth />} />
                        <Route path="active-session" element={<ActiveSession />} />
                        <Route path="activity-history" element={<ActivityHistory />} />
                        <Route path="connected-app" element={<ConnectedApp />} />
                        <Route path="app-signin" element={<AppSignIn />} />
                    </Route>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
