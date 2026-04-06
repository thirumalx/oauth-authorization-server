import { useOutletContext } from 'react-router-dom';
import { UserCircle, Mail, Key, Shield, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

interface ProfileContext {
    profile: Record<string, any> | null;
    loading: boolean;
    error: string;
}

export default function PersonalInfo() {
    const { profile, loading, error } = useOutletContext<ProfileContext>();

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

    return (
        <div className="grid gap-12 lg:grid-cols-5 animate-fade-in">
            {/* Primary Info Card */}
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 space-y-10 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                        <UserCircle className="w-64 h-64" />
                    </div>
                    
                    <div className="space-y-6 relative">
                        <div className="flex items-center gap-4">
                            <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-3.5">
                                <Key className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Subject</p>
                                <p className="font-black text-slate-900 text-xl tracking-tighter">{profile.sub || profile.user_name || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t border-slate-50">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Display Identifier</p>
                                <p className="font-black text-slate-900 text-2xl tracking-tight leading-none">{profile.name || profile.preferred_username || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Communication Channel</p>
                                <p className="font-black text-indigo-600 text-lg flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                    <Mail className="w-5 h-5" />
                                    {profile.email || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Issuing Authority</p>
                                <p className="font-bold text-slate-500 text-xs italic bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">{profile.iss || 'Local Authorization Server'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900 rounded-3xl text-white space-y-4 shadow-2xl shadow-slate-900/20">
                        <h4 className="text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                            <Shield className="w-4 h-4 text-indigo-400" />
                            Trust Level
                        </h4>
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-full" />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified Identity • High Assurance</p>
                    </div>
                </div>
            </div>

            {/* Claims Explorer */}
            <div className="lg:col-span-3">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-2xl shadow-slate-200/40 space-y-8 relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-8">
                        <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                            Identity Claims
                        </h2>
                        <span className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {Object.keys(profile).length} assertions
                        </span>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                        {Object.entries(profile).map(([key, value]) => (
                            <div key={key} className="rounded-3xl bg-slate-50 p-6 border border-slate-100 transition-all hover:bg-white hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-500/5 group">
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors uppercase tracking-widest">{key}</p>
                                    <div className="w-6 h-6 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm transition-transform group-hover:rotate-12">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="bg-white/80 p-3.5 rounded-2xl border border-slate-100 group-hover:bg-indigo-50/30 group-hover:border-indigo-50 transition-colors">
                                    <code className="text-xs font-black text-slate-900 break-words line-clamp-2">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</code>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
