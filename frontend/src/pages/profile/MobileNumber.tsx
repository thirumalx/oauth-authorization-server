import { useState, useEffect } from 'react';
import { Phone, Plus, Trash2, CheckCircle, AlertCircle, RefreshCw, X, ShieldCheck, PhoneIncoming, Edit3, Save, Key, CheckCircle2 } from 'lucide-react';

interface ContactResource {
    contactId: number;
    loginId: string;
    verified: boolean;
    primary: boolean;
}

type VerifyStep = 'idle' | 'requesting' | 'entering' | 'success';

export default function MobileNumber() {
    const [mobiles, setMobiles] = useState<ContactResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newMobile, setNewMobile] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null); // contactId or -1 for adding

    // Verify flow state
    const [verifyContactId, setVerifyContactId] = useState<number | null>(null);
    const [verifyLoginId, setVerifyLoginId] = useState('');
    const [verifyStep, setVerifyStep] = useState<VerifyStep>('idle');
    const [otp, setOtp] = useState('');
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [verifySubmitting, setVerifySubmitting] = useState(false);

    const fetchMobiles = async () => {
        try {
            setLoading(true);
            const response = await fetch('/profile/phone-number');
            if (!response.ok) throw new Error('Failed to fetch mobile numbers');
            const data = await response.json();
            setMobiles(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMobiles();
    }, []);

    const handleAddMobile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMobile) return;

        setActionLoading(-1);
        try {
            const response = await fetch('/profile/phone-number', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: newMobile })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add mobile number');
            }
            setNewMobile('');
            setIsAdding(false);
            await fetchMobiles();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateMobile = async (contactId: number) => {
        if (!editValue || editValue === mobiles.find(m => m.contactId === contactId)?.loginId) {
            setEditingId(null);
            return;
        }

        setActionLoading(contactId);
        try {
            const response = await fetch(`/profile/phone-number/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: editValue })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update mobile number');
            }
            setEditingId(null);
            await fetchMobiles();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteMobile = async (contactId: number) => {
        if (!confirm('Are you sure you want to remove this mobile number?')) return;

        setActionLoading(contactId);
        try {
            const response = await fetch(`/profile/phone-number/${contactId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete mobile number');
            await fetchMobiles();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const startEditing = (mobile: ContactResource) => {
        setEditingId(mobile.contactId);
        setEditValue(mobile.loginId);
    };

    // ── Verify flow ──────────────────────────────────────────────────────────

    const openVerify = (mobile: ContactResource) => {
        setVerifyContactId(mobile.contactId);
        setVerifyLoginId(mobile.loginId);
        setVerifyStep('requesting');
        setOtp('');
        setVerifyError(null);
    };

    const closeVerify = () => {
        setVerifyContactId(null);
        setVerifyLoginId('');
        setVerifyStep('idle');
        setOtp('');
        setVerifyError(null);
    };

    const handleRequestOtp = async () => {
        if (!verifyContactId) return;
        setVerifySubmitting(true);
        setVerifyError(null);
        try {
            const res = await fetch(`/profile/phone-number/${verifyContactId}/request-otp`, {
                method: 'POST'
            });
            if (res.ok) {
                setVerifyStep('entering');
            } else {
                const data = await res.json().catch(() => ({}));
                setVerifyError(data.message || 'Failed to send OTP. Please try again.');
            }
        } catch {
            setVerifyError('Network error. Please try again.');
        } finally {
            setVerifySubmitting(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifySubmitting(true);
        setVerifyError(null);
        try {
            const res = await fetch('/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contact: verifyLoginId, otp })
            });
            const data = await res.json().catch(() => ({}));
            if (res.ok && data.verified) {
                setVerifyStep('success');
                await fetchMobiles();
            } else {
                setVerifyError(data.message || 'Invalid OTP. Please try again.');
            }
        } catch {
            setVerifyError('Network error. Please try again.');
        } finally {
            setVerifySubmitting(false);
        }
    };

    if (loading && mobiles.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
                <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mt-8">Retrieving Secure Mobile Channels...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 relative">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 relative">
                        <Phone className="w-4 h-4" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-black text-slate-900 tracking-tight">Mobile Numbers</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug truncate">
                            Manage your mobile numbers for SMS alerts, two-factor authentication and account recovery.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shrink-0 ${isAdding ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
                    >
                        {isAdding ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Mobile</>}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Add Mobile Form */}
            {isAdding && (
                <div className="bg-white rounded-[2rem] border-2 border-dashed border-indigo-200 p-8 shadow-2xl shadow-indigo-100/20 animate-slide-up">
                    <form onSubmit={handleAddMobile} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="tel"
                                required
                                value={newMobile}
                                onChange={(e) => setNewMobile(e.target.value)}
                                placeholder="Enter your mobile number (e.g. +1 555 000 0000)..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={actionLoading === -1}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {actionLoading === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><PhoneIncoming className="w-4 h-4" /> Register Number</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Mobile List */}
            <div className="grid gap-4">
                {mobiles.map((mobile) => (
                    <div
                        key={mobile.contactId}
                        className={`bg-white rounded-3xl border transition-all group lg:pr-10 ${editingId === mobile.contactId ? 'border-indigo-400 shadow-2xl shadow-indigo-100 p-8' : 'border-slate-200 p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5'} flex flex-col md:flex-row items-center justify-between gap-6`}
                    >
                        <div className="flex items-center gap-6 flex-1 w-full">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${mobile.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {mobile.verified ? <CheckCircle className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                            </div>

                            <div className="space-y-1 flex-1">
                                {editingId === mobile.contactId ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Update Mobile Number</p>
                                        <input
                                            autoFocus
                                            type="tel"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">{mobile.loginId}</h3>
                                            {mobile.primary && (
                                                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest">Primary</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                                            <span className={mobile.verified ? 'text-emerald-600' : 'text-amber-600'}>
                                                {mobile.verified ? 'Verified Identity' : 'Pending Verification'}
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-400 tracking-tighter">SMS Enabled</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-600 font-black tracking-normal normal-case">{mobile.loginId}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {editingId === mobile.contactId ? (
                                <>
                                    <button
                                        onClick={() => handleUpdateMobile(mobile.contactId)}
                                        disabled={actionLoading === mobile.contactId}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {actionLoading === mobile.contactId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save</>}
                                    </button>
                                    <button
                                        onClick={() => setEditingId(null)}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    {!mobile.verified && (
                                        <button
                                            onClick={() => openVerify(mobile)}
                                            className="px-5 py-2.5 bg-white border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-600 hover:bg-amber-50 hover:border-amber-300 transition-all active:scale-95"
                                        >
                                            Verify
                                        </button>
                                    )}
                                    <button
                                        onClick={() => startEditing(mobile)}
                                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center shadow-sm"
                                        title="Edit Mobile Number"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    {!mobile.primary && (
                                        <button
                                            onClick={() => handleDeleteMobile(mobile.contactId)}
                                            disabled={actionLoading === mobile.contactId}
                                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                                            title="Remove Mobile Number"
                                        >
                                            {actionLoading === mobile.contactId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {mobiles.length === 0 && !loading && (
                    <div className="bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 p-12 text-center">
                        <p className="text-slate-400 font-bold italic">No mobile numbers found.</p>
                    </div>
                )}
            </div>

            {/* ── Verify Modal ─────────────────────────────────────────────────── */}
            {verifyStep !== 'idle' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-[2rem] shadow-2xl shadow-indigo-500/10 border border-slate-200 w-full max-w-md p-8 relative animate-slide-up">

                        {/* Close button */}
                        <button
                            onClick={closeVerify}
                            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* ── Step: requesting (confirm send) ── */}
                        {verifyStep === 'requesting' && (
                            <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">Verify Mobile Number</p>
                                        <p className="text-[10px] font-bold text-slate-400 mt-0.5">An OTP will be sent via SMS</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sending OTP to</p>
                                    <p className="text-sm font-black text-indigo-600">{verifyLoginId}</p>
                                </div>

                                {verifyError && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold">{verifyError}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleRequestOtp}
                                    disabled={verifySubmitting}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                                >
                                    {verifySubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Key className="w-4 h-4" /> Send Verification Code</>}
                                </button>
                            </div>
                        )}

                        {/* ── Step: entering OTP ── */}
                        {verifyStep === 'entering' && (
                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="text-center space-y-2">
                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 mx-auto">
                                        <Key className="w-7 h-7" />
                                    </div>
                                    <p className="text-sm font-black text-slate-900">Enter Verification Code</p>
                                    <p className="text-xs font-bold text-slate-400">
                                        6-digit code sent to <span className="text-indigo-600">{verifyLoginId}</span>
                                    </p>
                                </div>

                                <input
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

                                {verifyError && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold">{verifyError}</p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={verifySubmitting || otp.length < 6}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
                                >
                                    {verifySubmitting ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Verify Number'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setVerifyStep('requesting'); setOtp(''); setVerifyError(null); }}
                                    className="w-full text-slate-400 hover:text-indigo-600 text-xs font-black transition-colors uppercase tracking-widest"
                                >
                                    ← Request a new code
                                </button>
                            </form>
                        )}

                        {/* ── Step: success ── */}
                        {verifyStep === 'success' && (
                            <div className="text-center space-y-6 py-2 animate-fade-in">
                                <div className="flex justify-center">
                                    <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
                                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-black text-slate-900">Number Verified!</p>
                                    <p className="text-sm font-bold text-slate-400">{verifyLoginId} is now verified.</p>
                                </div>
                                <button
                                    onClick={closeVerify}
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
                                >
                                    <ShieldCheck className="w-4 h-4" /> Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
