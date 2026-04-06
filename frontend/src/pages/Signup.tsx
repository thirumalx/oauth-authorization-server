import React, { useState, useEffect } from 'react';
import { UserPlus, User, Mail, Phone, Lock, Calendar, Building2, UserCircle, ArrowRight, RefreshCw } from 'lucide-react';

interface FormData {
    firstName: string;
    middleName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
    individual: boolean;
    registeredClientId: string;
}

export default function Signup() {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        individual: true,
        registeredClientId: ''
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('client_id');
        if (clientId) {
            setFormData(prev => ({ ...prev, registeredClientId: clientId }));
        }

        const error = urlParams.get('error');
        if (error) {
            setErrorMessage(error);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'radio') {
            setFormData(prev => ({
                ...prev,
                [name]: value === 'true'
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }
        setLoading(true);
        setErrorMessage(null);
        
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Navigate to verify-otp
                window.location.href = `/verify-otp?loginUuid=${data.loginUuid}`;
            } else {
                setErrorMessage(data.message || "Signup failed. Please check your details.");
            }
        } catch (err) {
            setErrorMessage("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-2 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-full max-w-3xl">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-75 h-12 rounded-xl bg-indigo-50 border border-indigo-100">
                            <UserPlus className="w-15 h-6 text-indigo-600" />
                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Create Account</h3>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="mt-0.5 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-red-600 font-bold text-xs">!</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
                            </div>
                            <button 
                                onClick={() => setErrorMessage(null)}
                                className="text-red-400 hover:text-red-600 transition-colors"
                            >
                                <span className="text-lg leading-none">×</span>
                            </button>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Name Section */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">First Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                    <input
                                        type="text"
                                        name="firstName"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        placeholder="First Name"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">Middle Name</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                    <input
                                        type="text"
                                        name="middleName"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        placeholder="Middle Name"
                                        value={formData.middleName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">Last Name *</label>
                                <div className="relative group">
                                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                    <input
                                        type="text"
                                        name="lastName"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        placeholder="Last Name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contact Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">Email Address *</label>
                                <div className="relative group">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">Phone Number *</label>
                                <div className="relative group">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        placeholder="10-15 digits"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">Password *</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        minLength={8}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">Confirm Password *</label>
                                <div className="relative group">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-2.5 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account Type & DOB */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">Account Type</label>
                                <div className="flex gap-4 p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                                    <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${formData.individual ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>
                                        <input type="radio" name="individual" value="true" checked={formData.individual} onChange={handleChange} className="hidden" />
                                        <UserCircle className="w-4 h-4" />
                                        <span className="text-sm font-bold">Individual</span>
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 ${!formData.individual ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>
                                        <input type="radio" name="individual" value="false" checked={!formData.individual} onChange={handleChange} className="hidden" />
                                        <Building2 className="w-4 h-4" />
                                        <span className="text-sm font-bold">Organisation</span>
                                    </label>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700 ml-0.5">
                                    {formData.individual ? 'Date of Birth *' : 'Date of Incorporation *'}
                                </label>
                                <div className="relative group">
                                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" />
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 pl-11 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                        value={formData.dateOfBirth}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-3.5 px-6 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-[0.98] group disabled:opacity-50"
                            >
                                {loading ? (
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Create Account
                                        <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>

                            <div className="mt-2 text-center space-y-2">
                                <p className="text-slate-500 text-sm font-medium">
                                    Already have an account?{' '}
                                    <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-bold transition-colors">
                                        Sign In
                                    </a>
                                </p>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
