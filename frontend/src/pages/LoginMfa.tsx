import { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, Mail, Phone, Lock, RefreshCw, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';

interface MfaMethod {
    mfaId: number;
    mfaCd: number;
    mfaName: string;
    destination: string;
}

export default function LoginMfa() {
    const [methods, setMethods] = useState<MfaMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMethod, setSelectedMethod] = useState<MfaMethod | null>(null);
    
    // Verification state
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [timer, setTimer] = useState(0);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchMethods = async () => {
            try {
                setLoading(true);
                const response = await fetch('/otp/login-mfa/methods');
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || 'MFA session expired or unauthorized.');
                }
                const data = await response.json();
                setMethods(data);
                if (data.length === 1) {
                    // Auto-select if only one option exists
                    handleSelectMethod(data[0]);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMethods();
    }, []);

    useEffect(() => {
        let interval: any;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSelectMethod = async (method: MfaMethod) => {
        setSelectedMethod(method);
        setError(null);
        setCode('');
        setSent(false);

        // If it is Email or SMS, trigger OTP send automatically
        if (method.mfaCd === 1 || method.mfaCd === 2) {
            await handleSendOtp(method.mfaId);
        } else {
            // TOTP doesn't require sending anything
            setSent(true);
        }
    };

    const handleSendOtp = async (mfaId: number) => {
        try {
            setSending(true);
            setError(null);
            const response = await fetch('/otp/login-mfa/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mfaId })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to dispatch verification code.');
            }

            setSent(true);
            setTimer(60); // 1-minute countdown
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMethod || !code || code.length < 6) return;

        try {
            setVerifying(true);
            setError(null);
            const response = await fetch('/otp/login-mfa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mfaId: selectedMethod.mfaId, code })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Verification failed. Please check your code.');
            }

            const data = await response.json();
            setSuccess(true);
            
            // Redirect after brief visual success delay
            setTimeout(() => {
                window.location.href = data.redirectUrl || '/profile';
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-8 max-w-[440px] w-full text-center">
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Authenticating Identity...</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Checking Multi-Factor Configurations</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-full max-w-[440px]">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 md:p-10 relative overflow-hidden">
                    
                    {/* Visual Success Overlay */}
                    {success && (
                        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-4 animate-scale-up">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Verification Successful</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">
                                Establishing secure user session... Redirecting now.
                            </p>
                        </div>
                    )}

                    {/* Back Button inside verify mode */}
                    {selectedMethod && methods.length > 1 && !success && (
                        <button 
                            onClick={() => setSelectedMethod(null)}
                            className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest mb-6"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back to methods
                        </button>
                    )}

                    {/* Header */}
                    {!selectedMethod && (
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 mb-4">
                                <KeyRound className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">MFA Verification</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">
                                Complete verification using configured methods
                            </p>
                        </div>
                    )}

                    {/* Error Alerts */}
                    {error && (
                        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs animate-in fade-in slide-in-from-top-1">
                            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                            <div>
                                <p className="font-bold">Verification Exception</p>
                                <p className="text-red-600 font-semibold mt-0.5 leading-normal">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Method Selector Screen */}
                    {!selectedMethod && (
                        <div className="space-y-4">
                            {methods.map((method) => {
                                const Icon = method.mfaCd === 1 ? Mail : (method.mfaCd === 2 ? Phone : Lock);
                                return (
                                    <button
                                        key={method.mfaId}
                                        onClick={() => handleSelectMethod(method)}
                                        className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/10 rounded-xl transition-all duration-200 active:scale-[0.98] group shadow-sm"
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 group-hover:scale-105 transition-transform">
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="text-left min-w-0">
                                                <h4 className="text-sm font-bold text-slate-800">{method.mfaName}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{method.destination}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                                    </button>
                                );
                            })}
                            
                            {methods.length === 0 && (
                                <div className="text-center py-6">
                                    <p className="text-xs font-semibold text-slate-500 leading-normal">
                                        No active verified MFA methods found. Please contact administration.
                                    </p>
                                    <a 
                                        href="/login" 
                                        className="inline-block mt-4 text-xs font-black text-indigo-600 hover:text-indigo-500 uppercase tracking-widest"
                                    >
                                        Return to login
                                    </a>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Code Input Form Screen */}
                    {selectedMethod && (
                        <div className="space-y-6">
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 mb-4">
                                    {selectedMethod.mfaCd === 1 ? <Mail className="w-6 h-6 text-indigo-600" /> : 
                                     (selectedMethod.mfaCd === 2 ? <Phone className="w-6 h-6 text-indigo-600" /> : 
                                      <Lock className="w-6 h-6 text-indigo-600" />)}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                                    {selectedMethod.mfaCd === 4 ? 'Authenticator Code' : 'Verify Code'}
                                </h3>
                                <p className="text-xs font-semibold text-slate-400 mt-2 leading-relaxed max-w-xs mx-auto">
                                    {selectedMethod.mfaCd === 4 
                                        ? 'Enter the active 6-digit code from your Google Authenticator app.'
                                        : `We sent a 6-digit verification code to ${selectedMethod.destination}`}
                                </p>
                                {sent && selectedMethod.mfaCd !== 4 && (
                                    <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-[10px] font-black uppercase tracking-wider animate-in fade-in zoom-in-95 duration-200">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Code Sent
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleVerify} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label htmlFor="code" className="text-xs font-extrabold text-slate-400 uppercase tracking-widest ml-0.5">Verification Code</label>
                                    <div className="relative group">
                                        <input
                                            id="code"
                                            type="text"
                                            required
                                            maxLength={6}
                                            pattern="[0-9]*"
                                            inputMode="numeric"
                                            className="block w-full text-center py-3 text-lg font-black tracking-[0.4em] bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                                            placeholder="000000"
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            autoFocus
                                            disabled={verifying}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={verifying || code.length < 6}
                                    className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Confirm Code'}
                                </button>
                            </form>

                            {/* Resend details for SMS / Email OTP */}
                            {(selectedMethod.mfaCd === 1 || selectedMethod.mfaCd === 2) && (
                                <div className="text-center pt-2">
                                    <p className="text-xs font-semibold text-slate-400">
                                        Didn't receive the code?{' '}
                                        {timer > 0 ? (
                                            <span className="text-indigo-600 font-bold">Resend in {timer}s</span>
                                        ) : (
                                            <button
                                                onClick={() => handleSendOtp(selectedMethod.mfaId)}
                                                disabled={sending}
                                                className="text-indigo-600 hover:text-indigo-500 font-bold hover:underline transition-colors outline-none"
                                            >
                                                {sending ? 'Sending...' : 'Resend Code'}
                                            </button>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
