import React, { useState } from 'react';
import { Mail, Lock, Key, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

type Step = 'request' | 'verify' | 'success';

export default function ForgotPassword() {
    const [step, setStep] = useState<Step>('request');
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleRequestOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/user/request-otp?purpose=reset-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId, password })
            });
            if (response.ok) {
                setStep('verify');
            } else {
                const data = await response.json();
                setError(data.message || "Failed to send OTP");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/user/reset-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId, password, otp })
            });
            if (response.ok) {
                setStep('success');
            } else {
                const data = await response.json();
                setError(data.message || "Invalid OTP");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 space-y-8 relative overflow-hidden">
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
                    
                    <div className="text-center space-y-2 relative z-10">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-100/50">
                                <Key className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            {step === 'request' && 'Forgot Password?'}
                            {step === 'verify' && 'Verify Code'}
                            {step === 'success' && 'Reset Successful!'}
                        </h1>
                        <p className="text-slate-500 font-medium tracking-tight">
                            {step === 'request' && 'Enter your details to reset password'}
                            {step === 'verify' && `Code sent to ${loginId}`}
                            {step === 'success' && 'Your password has been securely reset'}
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 animate-fade-in font-semibold text-sm shadow-sm shadow-red-50">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {step === 'request' && (
                        <form onSubmit={handleRequestOtp} className="space-y-6 relative z-10">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Email or Phone</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="user@example.com"
                                        value={loginId}
                                        onChange={(e) => setLoginId(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        minLength={8}
                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="w-full flex items-center justify-center py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all duration-200 active:scale-[0.98] group">
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : (
                                    <span className="flex items-center justify-center gap-2">
                                        Send Verification Code
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>
                    )}

                    {step === 'verify' && (
                        <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
                            <div className="space-y-4 text-center">
                                <label className="text-sm font-bold text-slate-700">Enter 6-digit Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.75em] text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                    autoFocus
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
                                {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Reset Password'}
                            </button>
                            <button type="button" onClick={() => setStep('request')} className="w-full text-slate-500 hover:text-indigo-600 text-sm font-bold transition-colors uppercase tracking-widest">
                                Try a different account
                            </button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="space-y-8 animate-fade-in py-4 text-center relative z-10">
                            <div className="flex justify-center">
                                <div className="p-5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm shadow-emerald-50">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-extrabold text-slate-900">All set!</p>
                                <p className="text-slate-500 font-medium">Your password has been successfully updated.</p>
                            </div>
                            <a href="/login" className="w-full block py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all text-center">
                                Back to Sign In
                            </a>
                        </div>
                    )}

                    {step !== 'success' && (
                        <a href="/login" className="flex items-center justify-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] pt-6 border-t border-slate-50">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Login
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
