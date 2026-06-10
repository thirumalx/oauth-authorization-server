import { useEffect, useState } from 'react';
import { ShieldAlert, Check, X, ShieldCheck } from 'lucide-react';

export default function Consent() {
    const [clientId, setClientId] = useState('');
    const [scopes, setScopes] = useState<string[]>([]);
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [searchString, setSearchString] = useState('');
    
    // Scopes that the user has previously approved (in a real app, you'd fetch this from the backend)
    const [previouslyApprovedScopes] = useState<string[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearchString(window.location.search);
        
        const clientIdParam = params.get('client_id');
        const scopeParam = params.get('scope');

        const preserved: Record<string, string> = {};
        params.forEach((value, key) => {
            if (key !== 'scope') {
                preserved[key] = value;
            }
        });
        setQueryParams(preserved);

        if (clientIdParam) setClientId(clientIdParam);
        if (scopeParam) {
            // OAuth2 scopes are space-delimited
            setScopes(scopeParam.split(' ').filter(Boolean));
        }
    }, []);

    // Format scope names to be more readable
    const formatScopeName = (scope: string) => {
        return scope.split('.').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <div className="page-background selection:bg-indigo-100 selection:text-indigo-900 flex items-center justify-center p-4">
            
            <div className="w-full max-w-xl animate-fade-in relative z-10">
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/60 p-10 md:p-14 space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-50 rounded-full blur-3xl -mr-24 -mt-24 opacity-40 pointer-events-none" />
                    
                    <div className="text-center space-y-6 relative z-10">
                        <div className="flex justify-center mb-8">
                            <div className="p-5 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-200 transform hover:rotate-6 transition-transform">
                                <ShieldAlert className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em]">Authorization Protocol</p>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">
                                Permissive Access
                            </h1>
                        </div>
                        <p className="text-slate-500 font-medium text-lg px-4">
                            <span className="text-indigo-600 font-black decoration-indigo-200 underline-offset-4">{clientId || 'Third-party Service'}</span> is requesting access to your account data.
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 space-y-6 relative z-10">
                        <div className="flex items-center justify-between border-b border-slate-200/50 pb-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                Requested Scopes
                            </h3>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">OIDC Standard</span>
                        </div>
                        
                        <form action="/oauth2/authorize" method="POST" id="consent-form" className="space-y-8">
                            {Object.entries(queryParams).map(([key, value]) => (
                                <input key={key} type="hidden" name={key} value={value} />
                            ))}
                            <div className="space-y-4">
                                {scopes.map((scope) => {
                                    const isPreviouslyApproved = previouslyApprovedScopes.includes(scope);
                                    return (
                                        <label key={scope} className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-300 ${isPreviouslyApproved ? 'bg-slate-100/50 border-slate-100 opacity-50 grayscale' : 'bg-white border-slate-200 hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer group'}`}>
                                            <div className="mt-1">
                                                <input
                                                    type="checkbox"
                                                    name="scope"
                                                    value={scope}
                                                    id={scope}
                                                    defaultChecked={true}
                                                    disabled={isPreviouslyApproved}
                                                    className="w-5 h-5 rounded-lg border-slate-300 bg-white text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:ring-offset-0 transition-all cursor-pointer"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 text-base tracking-tight group-hover:text-indigo-600 transition-colors">{formatScopeName(scope)}</span>
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1 opacity-70">{scope}</span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>

                            <div className="pt-8 border-t border-slate-200/50 flex flex-col sm:flex-row gap-5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const form = document.getElementById('consent-form') as HTMLFormElement;
                                        if (form) {
                                            form.action = `/oauth2/authorize${searchString}`;
                                            form.submit();
                                        }
                                    }}
                                    className="flex-1 px-8 py-4 rounded-2xl font-black bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:border-red-100 hover:text-red-600 transition-all flex items-center justify-center gap-3 active:scale-95 group shadow-sm"
                                >
                                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                    <span className="uppercase tracking-widest text-xs">Deny Access</span>
                                </button>
                                
                                <button
                                    type="submit"
                                    id="submit-consent"
                                    className="flex-1 px-8 py-4 rounded-2xl font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3 active:scale-95 group"
                                >
                                    <Check className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    <span className="uppercase tracking-widest text-xs">Grant Permission</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="text-center space-y-4 px-6 relative z-10">
                        <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-relaxed">
                            Consent can be revoked at any time from your account security dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
