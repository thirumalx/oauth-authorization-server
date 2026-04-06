import { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [logout, setLogout] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setError(params.has('error'));
        setLogout(params.has('logout'));
        setSignupSuccess(params.has('signup'));

        const preserved: Record<string, string> = {};
        params.forEach((value, key) => {
            if (!['error', 'logout', 'signup'].includes(key)) {
                preserved[key] = value;
            }
        });
        setQueryParams(preserved);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-1 selection:bg-indigo-100 selection:text-indigo-900">
            <div className="w-full max-w-[440px]">
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 p-8 md:p-10">
                    <div className="text-center mb-5">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 mb-6">
                            <LogIn className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Welcome Back</h3>
                    </div>

                    {error && (
                        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">Invalid username or password.</p>
                        </div>
                    )}

                    {logout && (
                        <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">Successfully logged out.</p>
                        </div>
                    )}

                    {signupSuccess && (
                        <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">Account created successfully. Please sign in.</p>
                        </div>
                    )}

                    <form action="/login" method="POST" className="space-y-5">
                        {Object.entries(queryParams).map(([key, value]) => (
                            <input key={key} type="hidden" name={key} value={value} />
                        ))}

                        <div className="space-y-0.5">
                            <label htmlFor="username" className="text-sm font-semibold text-slate-700 ml-0.5">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600 text-slate-400">
                                    <Mail className="w-4.5 h-4.5" />
                                </div>
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between px-0.5">
                                <label htmlFor="password" className="text-sm font-semibold text-slate-700">Password</label>
                                <a href="/forgot-password" hidden className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-indigo-600 text-slate-400">
                                    <Lock className="w-4.5 h-4.5" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 shadow-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-500/20 cursor-pointer transition-colors" />
                                <span className="group-hover:text-slate-900 transition-colors font-medium">Remember me</span>
                            </label>
                            <a href="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Forgot password?</a>
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all duration-200 active:scale-[0.98] group"
                        >
                            Sign In
                            <LogIn className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 relative flex items-center">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-slate-100"></div>
                        </div>
                        <div className="relative flex justify-between w-full">
                            <span className="bg-white pr-3 text-xs font-extrabold text-slate-400 uppercase tracking-widest whitespace-nowrap">New here?</span>
                            <a 
                                href="/verify-otp" 
                                className="bg-white pl-3 text-xs font-extrabold text-indigo-600 hover:text-indigo-500 transition-colors uppercase tracking-widest whitespace-nowrap"
                            >
                                Verify Account
                            </a>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                        <a
                            href="/signup"
                            className="w-full flex items-center justify-center py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-[0.98]"
                        >
                            Create an account
                        </a>

                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-slate-500">
                    &copy; {new Date().getFullYear()} OAuth Authorization Server. All rights reserved.
                </p>
            </div>
        </div>
    );
}
