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
        <div className="page-background selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <main className="page-main pt-6">
                <div className="max-w-4xl mx-auto animate-fade-in space-y-3">

                    <div className="flex items-center justify-between relative z-10">
                        <a href="/user" className="inline-flex items-center text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-all uppercase tracking-[0.3em] gap-2 active:scale-95 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Identity List
                        </a>
                        <div className="px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            New Identity Provisioning
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-10 md:p-5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none group">
                            <UserPlus className="w-64 h-64 group-hover:rotate-12 transition-transform duration-700" />
                        </div>

                        <div className="relative z-10 space-y-5">
                            <div className="space-y-6">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Create Identity</h3>
                            </div>

                            {status === 'success' && (
                                <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem] text-emerald-700 flex items-center gap-6 animate-fade-in shadow-2xl shadow-emerald-200/20">
                                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-emerald-100/50">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black tracking-tight">Identity Created</p>
                                        <p className="text-sm font-bold opacity-80">Successfully synchronized with the identity provider. Redirecting...</p>
                                    </div>
                                </div>
                            )}

                            {status === 'error' && (
                                <div className="p-8 bg-red-50 border border-red-100 rounded-[2rem] text-red-700 flex items-center gap-6 animate-fade-in shadow-2xl shadow-red-200/20">
                                    <div className="p-4 bg-white rounded-2xl shadow-xl shadow-red-100/50">
                                        <AlertCircle className="w-8 h-8 text-red-500 shrink-0" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-black tracking-tight">Provisioning Failed</p>
                                        <p className="text-sm font-bold opacity-80">{errorMessage}</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">First Name</label>
                                        <input type="text" name="firstName" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g. John" value={formData.firstName} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Middle Name</label>
                                        <input type="text" name="middleName" className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="Optional" value={formData.middleName} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Last Name</label>
                                        <input type="text" name="lastName" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="e.g. Doe" value={formData.lastName} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                        <input type="email" name="email" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="john.doe@enterprise.com" value={formData.email} onChange={handleChange} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                        <input type="tel" name="phoneNumber" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="+1 (555) 000-0000" value={formData.phoneNumber} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
                                    <div className="space-y-5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Classification</label>
                                        <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                                            <label className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl cursor-pointer transition-all duration-300 ${formData.individual ? 'bg-white text-indigo-600 shadow-2xl shadow-indigo-200/50 font-black scale-[1.02]' : 'text-slate-400 hover:text-slate-600 font-bold'}`}>
                                                <input type="radio" name="individual" value="true" checked={formData.individual} onChange={handleChange} className="hidden" />
                                                <UserCircle className="w-5 h-5" />
                                                <span className="text-sm">Personal</span>
                                            </label>
                                            <label className={`flex-1 flex items-center justify-center gap-3 py-3 px-6 rounded-xl cursor-pointer transition-all duration-300 ${!formData.individual ? 'bg-white text-indigo-600 shadow-2xl shadow-indigo-200/50 font-black scale-[1.02]' : 'text-slate-400 hover:text-slate-600 font-bold'}`}>
                                                <input type="radio" name="individual" value="false" checked={!formData.individual} onChange={handleChange} className="hidden" />
                                                <Building2 className="w-5 h-5" />
                                                <span className="text-sm">Corporate</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Birth Allocation</label>
                                        <input type="date" name="dateOfBirth" required className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm" value={formData.dateOfBirth} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Security Credential (Password)</label>
                                    <input type="password" name="password" required minLength={8} className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-6 text-slate-900 font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm" placeholder="••••••••••••" value={formData.password} onChange={handleChange} />
                                    <p className="text-[10px] font-black text-indigo-400 ml-1 uppercase tracking-widest opacity-60">Minimum complexity: 8 characters required</p>
                                </div>

                                <div className="pt-5 border-t border-slate-50 flex justify-end">
                                    <button type="submit" disabled={loading} className="w-full md:w-auto md:px-16 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-2xl shadow-indigo-200 flex items-center justify-center gap-4 transition-all active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                <span className="uppercase tracking-widest text-sm">Synchronizing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 group-hover:scale-125 transition-transform duration-300" />
                                                <span className="uppercase tracking-widest text-sm">Provision Identity</span>
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
