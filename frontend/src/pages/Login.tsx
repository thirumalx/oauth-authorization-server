import { useState, useEffect } from 'react';
import { LogIn, Mail, Lock, AlertCircle, CheckCircle2, Key, RefreshCw } from 'lucide-react';

// Utility: Decode Base64URL to ArrayBuffer
function base64urlToArrayBuffer(base64url: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

// Utility: Encode ArrayBuffer to Base64URL
function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = window.btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [logout, setLogout] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [queryParams, setQueryParams] = useState<Record<string, string>>({});
    const [passkeyLoading, setPasskeyLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handlePasskeyLogin = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!navigator.credentials) {
            setErrorMsg('WebAuthn/Passkeys are only supported in secure contexts (HTTPS or localhost/127.0.0.1).');
            return;
        }
        setPasskeyLoading(true);
        setErrorMsg(null);

        try {
            // 1. Fetch request options from Spring Security (username is optional for discoverable credentials)
            const optionsRes = await fetch('/webauthn/authenticate/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: username.trim() ? JSON.stringify({ username: username }) : JSON.stringify({})
            });

            if (!optionsRes.ok) {
                throw new Error('User has no registered passkeys or username does not exist');
            }

            const options = await optionsRes.json();

            // 2. Decode options binary fields (challenge and allowCredentials ids)
            options.challenge = base64urlToArrayBuffer(options.challenge);
            if (options.allowCredentials) {
                options.allowCredentials = options.allowCredentials.map((cred: any) => ({
                    ...cred,
                    id: base64urlToArrayBuffer(cred.id)
                }));
            }

            // 3. Invoke browser WebAuthn API
            const assertion = (await navigator.credentials.get({
                publicKey: options
            })) as PublicKeyCredential;

            if (!assertion) {
                throw new Error('Authentication cancelled or rejected by user');
            }

            // 4. Encode assertion binary response back to Base64URL
            const responseObj = assertion.response as AuthenticatorAssertionResponse;
            const assertionPayload = {
                id: assertion.id,
                rawId: arrayBufferToBase64url(assertion.rawId),
                type: assertion.type,
                response: {
                    clientDataJSON: arrayBufferToBase64url(responseObj.clientDataJSON),
                    authenticatorData: arrayBufferToBase64url(responseObj.authenticatorData),
                    signature: arrayBufferToBase64url(responseObj.signature),
                    userHandle: responseObj.userHandle ? arrayBufferToBase64url(responseObj.userHandle) : null
                },
                clientExtensionResults: assertion.getClientExtensionResults() || {}
            };

            // 5. Submit assertion to /login/webauthn to log in
            const loginRes = await fetch('/login/webauthn', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assertionPayload)
            });

            if (!loginRes.ok) {
                throw new Error('Authentication failed: Invalid credentials or signature');
            }

            // 6. Redirect to profile page
            window.location.href = '/profile';
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'Passkey authentication failed');
        } finally {
            setPasskeyLoading(false);
        }
    };

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

                    {errorMsg && (
                        <div className="mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="font-medium">{errorMsg}</p>
                        </div>
                    )}

                    {!navigator.credentials && (
                        <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-xs animate-in fade-in slide-in-from-top-1 duration-300 font-medium">
                            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                            <div className="space-y-0.5 text-left">
                                <p className="font-black uppercase tracking-wider text-[9px]">Secure Context Required</p>
                                <p className="leading-relaxed text-slate-600">WebAuthn/Passkeys are disabled because this site is not accessed via HTTPS or localhost.</p>
                            </div>
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

                        <button
                            type="button"
                            onClick={handlePasskeyLogin}
                            disabled={passkeyLoading || !navigator.credentials}
                            title={!navigator.credentials ? "Passkeys require a secure context (HTTPS/localhost)" : ""}
                            className="w-full flex items-center justify-center py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-[0.98] group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {passkeyLoading ? (
                                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                            ) : (
                                <>
                                    Sign In with Passkey
                                    <Key className="ml-2 w-4 h-4 group-hover:rotate-12 transition-transform text-indigo-600" />
                                </>
                            )}
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
