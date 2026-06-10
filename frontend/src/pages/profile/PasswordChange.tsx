import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Lock, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Eye, EyeOff } from 'lucide-react';

type Step = 'request' | 'verify' | 'success';

interface ProfileContext {
    profile: Record<string, any> | null;
    loading: boolean;
    error: string;
}

export default function PasswordChange() {
    const { profile, loading } = useOutletContext<ProfileContext>();

    const [step, setStep] = useState<Step>('request');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // Use email as loginId, fall back to phoneNumber — only used for display
    const displayLoginId: string = profile?.email || profile?.phoneNumber || 'your registered contact';

    // ── Step 1: request OTP ──────────────────────────────────────────────────
    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/profile/change-password/request-otp', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                setStep('verify');
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Failed to send OTP. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Step 2: verify OTP + reset password ─────────────────────────────────
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch('/profile/change-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ otp, password }),
            });
            if (res.ok) {
                setStep('success');
            } else {
                const data = await res.json().catch(() => ({}));
                setError(data.message || 'Invalid OTP. Please try again.');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    // ── Loading skeleton ─────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
                <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs mt-6">Loading security context…</p>
            </div>
        );
    }

    // ── Shared header labels ─────────────────────────────────────────────────
    const headings: Record<Step, { title: string; sub: string }> = {
        request:  { title: 'Change Password',      sub: 'A verification code will be sent to your registered contact' },
        verify:   { title: 'Verify Identity',       sub: `Code sent to ${displayLoginId}` },
        success:  { title: 'Password Updated',      sub: 'Your account password has been securely changed' },
    };

    return (
        <div className="animate-fade-in space-y-6 pb-12">
            {/* ── Page header card ── */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 relative">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
                        <Lock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-tight text-slate-900">{headings[step].title}</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug">{headings[step].sub}</p>
                    </div>
                    {step === 'success' && (
                        <div className="ml-auto">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">
                                Done
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Main card ── */}
            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/40">

                {/* Progress indicator */}
                {step !== 'success' && (
                    <div className="flex items-center gap-2 mb-8">
                        {(['request', 'verify'] as Step[]).map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                                    step === s
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : (i === 0 && step === 'verify')
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-slate-100 text-slate-400'
                                }`}>
                                    {i === 0 && step === 'verify' ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${step === s ? 'text-indigo-600' : 'text-slate-300'}`}>
                                    {s === 'request' ? 'New Password' : 'Verify OTP'}
                                </span>
                                {i === 0 && <div className="w-8 h-px bg-slate-100 mx-1" />}
                            </div>
                        ))}
                    </div>
                )}

                {/* Error banner */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 mb-6 animate-fade-in">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* ── Step 1: Enter new password ── */}
                {step === 'request' && (
                    <form onSubmit={handleRequestOtp} className="space-y-5">
                        {/* Current loginId pill */}
                        <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-500">Changing password for:</span>
                            <span className="text-xs font-black text-indigo-600 truncate">{displayLoginId}</span>
                        </div>

                        {/* New password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    minLength={8}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 8 chars, 1 digit, 1 special char"
                                    className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-11 pr-12 text-slate-900 text-sm font-bold placeholder:text-slate-300 placeholder:font-normal focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700 uppercase tracking-widest ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    id="confirm-password"
                                    type={showConfirm ? 'text' : 'password'}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Repeat your new password"
                                    className={`w-full bg-white border rounded-xl py-3 pl-11 pr-12 text-slate-900 text-sm font-bold placeholder:text-slate-300 placeholder:font-normal focus:ring-4 outline-none transition-all ${
                                        confirmPassword && confirmPassword !== password
                                            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-500'
                                            : 'border-slate-200 focus:ring-indigo-500/10 focus:border-indigo-500'
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && confirmPassword !== password && (
                                <p className="text-xs font-bold text-red-500 ml-1">Passwords do not match</p>
                            )}
                        </div>

                        {/* Password rules hint */}
                        <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">Password Requirements</p>
                            <ul className="space-y-0.5">
                                {[
                                    ['At least 8 characters', password.length >= 8],
                                    ['At least 1 uppercase letter', /[A-Z]/.test(password)],
                                    ['At least 1 digit', /\d/.test(password)],
                                    ['At least 1 special character', /[^A-Za-z0-9]/.test(password)],
                                ].map(([rule, met]) => (
                                    <li key={rule as string} className={`text-[10px] font-bold flex items-center gap-1.5 ${met ? 'text-emerald-600' : 'text-slate-400'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${met ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                        {rule as string}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            id="send-otp-btn"
                            type="submit"
                            disabled={submitting}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] group"
                        >
                            {submitting
                                ? <RefreshCw className="w-5 h-5 animate-spin" />
                                : <><span>Send Verification Code</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                            }
                        </button>
                    </form>
                )}

                {/* ── Step 2: Enter OTP ── */}
                {step === 'verify' && (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="text-center space-y-3">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Enter the 6-digit code sent to</p>
                            <p className="text-sm font-black text-indigo-600">{displayLoginId}</p>
                        </div>

                        <input
                            id="otp-input"
                            type="text"
                            required
                            maxLength={6}
                            inputMode="numeric"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="000000"
                            autoFocus
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.75em] text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200"
                        />

                        <button
                            id="verify-otp-btn"
                            type="submit"
                            disabled={submitting || otp.length < 6}
                            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                        >
                            {submitting ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Change Password'}
                        </button>

                        <button
                            type="button"
                            onClick={() => { setStep('request'); setOtp(''); setError(null); }}
                            className="w-full text-slate-400 hover:text-indigo-600 text-xs font-black transition-colors uppercase tracking-widest"
                        >
                            ← Request a new code
                        </button>
                    </form>
                )}

                {/* ── Step 3: Success ── */}
                {step === 'success' && (
                    <div className="text-center space-y-8 py-4 animate-fade-in">
                        <div className="flex justify-center">
                            <div className="p-5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 className="w-14 h-14 text-emerald-500" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl font-black text-slate-900">Password Changed!</p>
                            <p className="text-sm font-bold text-slate-400">Your account password has been updated successfully.</p>
                        </div>
                        <button
                            id="done-btn"
                            onClick={() => { setStep('request'); setPassword(''); setConfirmPassword(''); setOtp(''); setError(null); }}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                        >
                            <Lock className="w-4 h-4" /> Change Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
