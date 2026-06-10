import React, { useState, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VerifyOTP() {
    const [loginUuid, setLoginUuid] = useState<string | null>(null);
    const [loginId, setLoginId] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [emailOtp, setEmailOtp] = useState('');
    const [phoneOtp, setPhoneOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendStatus, setResendStatus] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const uuid = params.get('loginUuid');
        setLoginUuid(uuid);

        if (uuid) {
            fetchUserDetails(uuid);
        }
    }, []);

    const fetchUserDetails = async (uuid: string) => {
        try {
            const response = await fetch(`/otp/user-info/${uuid}`);
            if (response.ok) {
                const user = await response.json();
                setEmail(user.email);
                setPhoneNumber(user.phoneNumber);
            }
        } catch (err) {
            console.error("Failed to fetch user details", err);
        }
    };

    const handleVerify = async (e: React.FormEvent, identifier?: string, code?: string, type?: 'email' | 'phone') => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const contactToVerify = identifier || loginId;
        const otpToVerify = code || otp;

        try {
            const response = await fetch('/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact: contactToVerify, otp: otpToVerify })
            });
            if (response.ok) {
                if (type === 'email') setEmailVerified(true);
                else if (type === 'phone') setPhoneVerified(true);
                else setSuccess(true);

                // For signup flow, check if both are done
                if (loginUuid) {
                    if ((type === 'email' && phoneVerified) || (type === 'phone' && emailVerified)) {
                        setSuccess(true);
                    }
                }
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

    const handleResend = async (identifier?: string) => {
        const contactToResend = identifier || loginId;
        if (!contactToResend) {
            setError("Please enter your Email or Phone first");
            return;
        }
        setResending(true);
        setResendStatus(null);
        try {
            const response = await fetch('/otp/resend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginId: contactToResend, purpose: 'verify-signup' })
            });
            if (response.ok) {
                setResendStatus(`Code resent to ${contactToResend}!`);
                setTimeout(() => setResendStatus(null), 5000);
            } else {
                const data = await response.json();
                setError(data.message || "Failed to resend code");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -ml-32 -mb-32" />

            <div className="w-full max-w-md animate-fade-in relative z-10">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 space-y-8 relative overflow-hidden">
                    <div className="text-center space-y-2 relative z-10">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-100/50">
                                <ShieldCheck className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            Verify Account
                        </h1>
                        <p className="text-slate-500 font-medium">Enter the code sent to your contact</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 animate-fade-in text-sm font-semibold shadow-sm shadow-red-50">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {!success ? (
                        <>
                            {loginUuid ? (
                                <div className="space-y-8 relative z-10">
                                    {/* Email Verification Row */}
                                    <div className={`p-5 rounded-2xl border transition-all duration-300 ${emailVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Email Verification</p>
                                                <p className="text-sm font-bold text-slate-900">{email}</p>
                                            </div>
                                            {emailVerified ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-emerald-200 shadow-sm">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Verified</span>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleResend(email)} className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">Resend</button>
                                            )}
                                        </div>
                                        {!emailVerified && (
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-center text-2xl font-black tracking-[0.5em] text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200"
                                                    placeholder="000000"
                                                    value={emailOtp}
                                                    onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                                />
                                                <button
                                                    onClick={(e) => handleVerify(e, email, emailOtp, 'email')}
                                                    disabled={loading || emailOtp.length < 6}
                                                    className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:grayscale"
                                                >
                                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Phone Verification Row */}
                                    <div className={`p-5 rounded-2xl border transition-all duration-300 ${phoneVerified ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="space-y-0.5">
                                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Mobile Verification</p>
                                                <p className="text-sm font-bold text-slate-900">{phoneNumber}</p>
                                            </div>
                                            {phoneVerified ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-emerald-200 shadow-sm">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Verified</span>
                                                </div>
                                            ) : (
                                                <button onClick={() => handleResend(phoneNumber)} className="text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-sm">Resend</button>
                                            )}
                                        </div>
                                        {!phoneVerified && (
                                            <div className="flex gap-3">
                                                <input
                                                    type="text"
                                                    maxLength={6}
                                                    className="flex-1 bg-white border border-slate-200 rounded-xl py-3 text-center text-2xl font-black tracking-[0.5em] text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200"
                                                    placeholder="000000"
                                                    value={phoneOtp}
                                                    onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                                />
                                                <button
                                                    onClick={(e) => handleVerify(e, phoneNumber, phoneOtp, 'phone')}
                                                    disabled={loading || phoneOtp.length < 6}
                                                    className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:grayscale"
                                                >
                                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {resendStatus && (
                                        <p className="text-xs text-center font-bold text-emerald-600 animate-fade-in">{resendStatus}</p>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleVerify} className="space-y-6 relative z-10">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Email or Phone</label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                                placeholder="Verify your email/phone"
                                                value={loginId}
                                                onChange={(e) => setLoginId(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 text-center">
                                            <label className="text-sm font-bold text-slate-700">OTP Code</label>
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.75em] text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200"
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                            />
                                        </div>
                                    </div>

                                    <button type="submit" disabled={loading || otp.length < 6} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
                                        {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto" /> : 'Verify Account'}
                                    </button>

                                    <div className="text-center pt-2 space-y-2">
                                        <button
                                            type="button"
                                            disabled={resending}
                                            onClick={() => handleResend()}
                                            className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
                                        >
                                            {resending && <RefreshCw className="w-4 h-4 animate-spin" />}
                                            Resend Code
                                        </button>
                                        {resendStatus && (
                                            <p className="text-xs font-bold text-emerald-600 animate-fade-in">{resendStatus}</p>
                                        )}
                                    </div>
                                </form>
                            )}
                        </>
                    ) : (
                        <div className="space-y-8 animate-fade-in py-4 text-center relative z-10">
                            <div className="flex justify-center">
                                <div className="p-5 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm shadow-emerald-50">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-extrabold text-slate-900">Success!</p>
                                <p className="text-slate-500 font-medium">Your identity has been verified. You're all set to go.</p>
                            </div>
                            <a href="/login" className="w-full block py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all text-center">
                                Sign In to Your Account
                            </a>
                        </div>
                    )}

                    {!success && (
                        <a href="/login" className="flex items-center justify-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] pt-6 border-t border-slate-50 relative z-10">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Return to Login
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
