import Navbar from './Navbar';
import { ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react';

export default function ConsentedApps() {
    return (
        <div className="page-background selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <main className="page-main pt-12 text-center flex flex-col items-center">
                <div className="w-full max-w-4xl animate-fade-in space-y-10">
                    
                    {/* Header */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 bg-indigo-600 h-full" />
                        <div className="flex items-center gap-6 text-left">
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm shadow-indigo-100/50">
                                <ShieldCheck className="w-10 h-10 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-[0.3em] mb-1">Access Management</p>
                                <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                    Authorized Applications
                                </h1>
                            </div>
                        </div>
                        
                        <div className="mt-6 md:mt-0">
                            <a href="/logout" className="bg-white border border-slate-200 hover:border-red-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-bold py-3 px-8 rounded-2xl transition-all flex items-center gap-2 shadow-sm text-sm tracking-tight group active:scale-95">
                                <LogOut className="w-4.5 h-4.5 group-hover:-translate-x-1 transition-transform" />
                                Sign Out
                            </a>
                        </div>
                    </div>

                    {/* Dashboard Content Shell */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-left">
                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-10 md:col-span-2 space-y-10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <LayoutDashboard className="w-80 h-80" />
                            </div>
                            
                            <div className="flex items-center justify-between border-b border-slate-50 pb-8 relative z-10">
                                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                    <span className="w-2 h-8 bg-indigo-600 rounded-full" />
                                    Active Consents
                                </h2>
                            </div>
                            
                            <div className="text-center py-24 space-y-8 relative z-10">
                                <div className="inline-flex items-center justify-center w-28 h-28 rounded-[2.5rem] bg-slate-50 border border-slate-100 shadow-sm">
                                    <ShieldCheck className="w-14 h-14 text-slate-200" />
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Everything is Clear</h3>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                                        You haven't granted access to any third-party applications yet. Your data remains private and secure.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 p-10 space-y-10 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] pointer-events-none">
                                <ShieldCheck className="w-32 h-32" />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-50 pb-8">Trust & Safety</h2>
                            <div className="flex-1 space-y-6">
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group">
                                    <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] mb-2">Active Sessions</h4>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed">Securely monitor your live login instances across devices.</p>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer group">
                                    <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] mb-2">Audit Logs</h4>
                                    <p className="text-xs font-bold text-slate-400 leading-relaxed">Trace every permission change and login event in real-time.</p>
                                </div>
                            </div>
                            
                            <div className="pt-10 border-t border-slate-50">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] text-center leading-loose opacity-60">
                                    Secure by Identity
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
