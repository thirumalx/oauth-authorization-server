import React, { useState } from 'react';
import Navbar from './Navbar';
import { UserPlus, ArrowLeft, Save, Building2, UserCircle, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function UserForm() {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        dateOfBirth: '',
        individual: true
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'radio') {
            setFormData(prev => ({ ...prev, [name]: value === 'true' }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                setStatus('success');
                setTimeout(() => window.location.href = '/user', 2000);
            } else {
                setStatus('error');
                setErrorMessage("Failed to create user. Please check the details.");
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-background selection:bg-indigo-100 selection:text-indigo-900 min-h-screen bg-slate-50/50 pb-20">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 mt-10">
                <div className="animate-fade-in space-y-6">
                    {/* Back header */}
                    <div className="flex items-center justify-between">
                        <a href="/user" className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-widest gap-2 group active:scale-95">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
                            Back to Identities
                        </a>
                        <div className="px-4 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100/50 rounded-full text-[9px] font-black uppercase tracking-widest">
                            New Identity Provisioning
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.015)] p-10 md:p-12 relative overflow-hidden">
                        {/* Decorative Icon */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.015] pointer-events-none">
                            <UserPlus className="w-64 h-64 rotate-6" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create New Identity</h3>
                                <p className="text-slate-400 text-sm font-bold mt-1">Register a new credential in the OAuth authorization provider.</p>
                            </div>

                            {/* Success Panel */}
                            {status === 'success' && (
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-800 flex items-center gap-5 animate-fade-in">
                                    <div className="p-3 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0 border border-emerald-100">
                                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-base font-black tracking-tight">Identity Created Successfully</p>
                                        <p className="text-xs font-bold opacity-80 mt-0.5">Synchronized with identity registry. Redirecting to dashboard...</p>
                                    </div>
                                </div>
                            )}

                            {/* Error Panel */}
                            {status === 'error' && (
                                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-800 flex items-center gap-5 animate-fade-in">
                                    <div className="p-3 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0 border border-red-100">
                                        <AlertCircle className="w-6 h-6 text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-base font-black tracking-tight">Provisioning Failed</p>
                                        <p className="text-xs font-bold opacity-80 mt-0.5">{errorMessage}</p>
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                        <input 
                                            type="text" 
                                            name="firstName" 
                                            required 
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3.5 px-5 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-sm shadow-sm" 
                                            placeholder="e.g. John" 
                                            value={formData.firstName} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Middle Name</label>
                                        <input 
                                            type="text" 
                                            name="middleName" 
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3.5 px-5 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-sm shadow-sm" 
                                            placeholder="Optional" 
                                            value={formData.middleName} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                        <input 
                                            type="text" 
                                            name="lastName" 
                                            required 
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3.5 px-5 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-sm shadow-sm" 
                                            placeholder="e.g. Doe" 
                                            value={formData.lastName} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            required 
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3.5 px-5 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-sm shadow-sm" 
                                            placeholder="john.doe@enterprise.com" 
                                            value={formData.email} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input 
                                            type="tel" 
                                            name="phoneNumber" 
                                            required 
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3.5 px-5 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-sm shadow-sm" 
                                            placeholder="+1 (555) 000-0000" 
                                            value={formData.phoneNumber} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Classification</label>
                                        <div className="flex gap-3 p-1.5 bg-slate-50 border border-slate-100 rounded-2xl shadow-inner">
                                            <label className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 border ${formData.individual ? 'bg-white border-slate-100 text-indigo-600 shadow-md font-black scale-[1.01]' : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'}`}>
                                                <input type="radio" name="individual" value="true" checked={formData.individual} onChange={handleChange} className="hidden" />
                                                <UserCircle className="w-4.5 h-4.5" />
                                                <span className="text-xs tracking-tight">Personal</span>
                                            </label>
                                            <label className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl cursor-pointer transition-all duration-300 border ${!formData.individual ? 'bg-white border-slate-100 text-indigo-600 shadow-md font-black scale-[1.01]' : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'}`}>
                                                <input type="radio" name="individual" value="false" checked={!formData.individual} onChange={handleChange} className="hidden" />
                                                <Building2 className="w-4.5 h-4.5" />
                                                <span className="text-xs tracking-tight">Corporate</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                        <input 
                                            type="date" 
                                            name="dateOfBirth" 
                                            required 
                                            className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3.5 px-5 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-sm shadow-sm" 
                                            value={formData.dateOfBirth} 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Credential (Password)</label>
                                    <input 
                                        type="password" 
                                        name="password" 
                                        required 
                                        minLength={8} 
                                        className="w-full bg-slate-50/50 border border-slate-200 focus:border-indigo-500 rounded-2xl py-3.5 px-5 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-sm shadow-sm" 
                                        placeholder="••••••••••••" 
                                        value={formData.password} 
                                        onChange={handleChange} 
                                    />
                                    <p className="text-[9px] font-black text-indigo-400 ml-1 uppercase tracking-widest opacity-60">Minimum complexity: 8 characters required</p>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex justify-end">
                                    <button 
                                        type="submit" 
                                        disabled={loading} 
                                        className="w-full md:w-auto md:px-12 py-4.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/10 flex items-center justify-center gap-3 transition-all active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span className="uppercase tracking-widest text-[11px]">Synchronizing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                                                <span className="uppercase tracking-widest text-[11px]">Provision Identity</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
