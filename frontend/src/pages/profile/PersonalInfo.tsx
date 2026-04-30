import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    UserCircle, Mail, Key, RefreshCw, AlertCircle,
    User, Calendar, Building2, Globe, MapPin, Languages,
    BadgeCheck, Fingerprint, ShieldCheck, Edit3, X, Save
} from 'lucide-react';

interface ProfileContext {
    profile: Record<string, any> | null;
    loading: boolean;
    error: string;
    refreshProfile: () => Promise<void>;
}

export default function PersonalInfo() {
    const { profile, loading, error, refreshProfile } = useOutletContext<ProfileContext>();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});

    // Load extended fields from localStorage and sync with profile
    useEffect(() => {
        if (profile) {
            const savedData = localStorage.getItem(`profile_ext_${profile.loginUuid || 'default'}`);
            const extended = savedData ? JSON.parse(savedData) : {};
            
            setFormData({
                ...profile,
                ...extended,
                // Ensure date is formatted for input[type="date"]
                dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : ''
            });
        }
    }, [profile, isEditing]);

    if (loading) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-xl animate-pulse rounded-full" />
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin relative" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mt-8">Decrypting Identity Claims...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-red-700 flex items-start gap-6 shadow-2xl shadow-red-200/20 animate-fade-in">
                <div className="p-3 bg-white rounded-2xl shadow-sm filter drop-shadow-sm">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <p className="text-xl font-black tracking-tight">Authentication Exception</p>
                    <p className="text-sm font-bold text-red-600 mt-2 leading-relaxed opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Save core fields to backend
            const backendData = {
                loginUuid: profile.loginUuid,
                firstName: formData.firstName,
                middleName: formData.middleName,
                lastName: formData.lastName,
                dateOfBirth: formData.dateOfBirth ? `${formData.dateOfBirth}T00:00:00Z` : null,
                individual: formData.individual === true || formData.individual === 'true'
            };

            const response = await fetch('/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backendData)
            });

            if (!response.ok) throw new Error('Failed to update core identity');

            // 2. Save extended fields to localStorage
            const extendedFields = {
                gender: formData.gender,
                language: formData.language,
                country: formData.country,
                state: formData.state,
                address: formData.address
            };
            localStorage.setItem(`profile_ext_${profile.loginUuid}`, JSON.stringify(extendedFields));

            await refreshProfile();
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            alert('Update failed. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const InfoItem = ({ icon: Icon, label, value, subValue, field, type = "text" }: { icon: any, label: string, value: any, subValue?: string, field?: string, type?: string }) => (
        <div className="rounded-2xl bg-slate-50/50 p-4 border border-slate-100/80 transition-all hover:bg-white hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 group flex flex-col justify-between">
            <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{label}</p>
                <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center border border-slate-100 shadow-sm transition-transform group-hover:rotate-6">
                    <Icon className="w-3.5 h-3.5 text-indigo-500" />
                </div>
            </div>
            
            {isEditing && field ? (
                <div className="space-y-1">
                    {type === "select" ? (
                        <select 
                            value={String(formData[field] ?? '')} 
                            onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 transition-colors"
                        >
                            <option value="">Select...</option>
                            {field === 'individual' ? (
                                <>
                                    <option value="true">Individual</option>
                                    <option value="false">Corporate</option>
                                </>
                            ) : null}
                            {field === 'gender' ? (
                                <>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </>
                            ) : null}
                        </select>
                    ) : (
                        <input 
                            type={type}
                            value={formData[field] ?? ''}
                            onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                            className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-900 outline-none focus:border-indigo-500 transition-colors"
                            placeholder={`Enter ${label.toLowerCase()}...`}
                        />
                    )}
                </div>
            ) : (
                <div className="bg-white/60 p-2.5 rounded-xl border border-slate-50 group-hover:bg-indigo-50/20 group-hover:border-indigo-50 transition-colors">
                    <p className="text-[13px] font-black text-slate-900 break-words leading-tight">
                        {field ? (field === 'individual' ? (profile.individual ? 'Individual' : 'Corporate') : (field.includes('Date') && value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : (formData[field] || profile[field] || 'Not Specified'))) : (value || 'Not Specified')}
                    </p>
                    {subValue && <p className="text-[8px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{subValue}</p>}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Identity Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-4 relative">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-200">
                            {profile.firstName?.[0]}{profile.lastName?.[0] || 'U'}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-white border-2 border-white shadow flex items-center justify-center">
                            <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                    </div>

                    {/* Name + meta */}
                    <div className="flex-1 min-w-0 space-y-1">
                        <h1 className="text-base font-black text-slate-900 tracking-tight truncate">
                            {profile.firstName} {profile.middleName} {profile.lastName}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-500 truncate">{profile.email || 'N/A'}</span>
                            </div>
                            <span className="text-slate-200">|</span>
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-500 truncate">{profile.sub || profile.user_name || 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Edit actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
                        >
                            {isEditing ? <><X className="w-3 h-3" /> Cancel</> : <><Edit3 className="w-3 h-3" /> Edit</>}
                        </button>
                        {isEditing && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-100 disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3" /> Save</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Identity & Type Card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/40 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            <span className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                            Personal Characteristics
                        </h3>
                        {/* Status indicators in view mode */}
                        {!isEditing && (
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">Active</span>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full text-[9px] font-black uppercase tracking-widest">High assurance</span>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoItem icon={User} label="First Name" field="firstName" value={profile.firstName} />
                        <InfoItem icon={User} label="Middle Name" field="middleName" value={profile.middleName} />
                        <InfoItem icon={User} label="Last Name" field="lastName" value={profile.lastName} />
                        <InfoItem 
                            icon={Building2} 
                            label="Entity Type" 
                            field="individual"
                            type="select"
                            value={profile.individual}
                            subValue={profile.individual === true ? 'NATURAL PERSON' : 'LEGAL ENTITY'}
                        />
                        <InfoItem 
                            icon={Calendar} 
                            label="DOB / Incorporation" 
                            field="dateOfBirth"
                            type="date"
                            value={profile.dateOfBirth} 
                        />
                        <InfoItem icon={UserCircle} label="Gender" field="gender" type="select" value={formData.gender} />
                    </div>
                </div>

                {/* Localization & Residence Card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/40 space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                            <span className="w-1.5 h-5 bg-indigo-500 rounded-full" />
                            Regional Context
                        </h3>
                        <Globe className="w-3.5 h-3.5 text-slate-300" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <InfoItem icon={Languages} label="Preferred Language" field="language" value={formData.language} />
                        <InfoItem icon={Globe} label="Country" field="country" value={formData.country} />
                        <InfoItem icon={MapPin} label="State / Province" field="state" value={formData.state} />
                        <div className="sm:col-span-2 lg:col-span-1">
                            <InfoItem icon={MapPin} label="Physical Address" field="address" value={formData.address} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

