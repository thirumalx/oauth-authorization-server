import { useState, useEffect } from 'react';
import { 
  Key, Plus, Trash2, ShieldCheck, AlertCircle, RefreshCw, X, Check, Laptop, Smartphone, HelpCircle
} from 'lucide-react';

interface PasskeyRecord {
  id: string;
  label: string;
  created: string;
  last_used: string | null;
  public_key_credential_type: string;
}

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

export default function Passkeys() {
  const [credentials, setCredentials] = useState<PasskeyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Registration States
  const [isRegistering, setIsRegistering] = useState(false);
  const [label, setLabel] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchCredentials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/webauthn/credentials');
      if (!res.ok) throw new Error('Failed to load registered passkeys');
      const data = await res.json();
      setCredentials(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleRegisterPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    setRegisterLoading(true);
    setError(null);

    try {
      // 1. Fetch creation options from Spring Security
      const optionsRes = await fetch('/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!optionsRes.ok) {
        throw new Error('Failed to generate passkey registration challenge');
      }
      
      const options = await optionsRes.json();
      
      // 2. Decode necessary base64url options to ArrayBuffers
      options.challenge = base64urlToArrayBuffer(options.challenge);
      options.user.id = base64urlToArrayBuffer(options.user.id);
      
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: base64urlToArrayBuffer(cred.id)
        }));
      }

      // 3. Invoke browser WebAuthn API
      const credential = (await navigator.credentials.create({
        publicKey: options
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Registration cancelled or rejected by authenticator');
      }

      // 4. Encode the response binary buffers to Base64URL strings
      const responseObj = credential.response as AuthenticatorAttestationResponse;
      const registrationPayload = {
        publicKey: {
          label: label,
          credential: {
            id: credential.id,
            rawId: arrayBufferToBase64url(credential.rawId),
            type: credential.type,
            response: {
              clientDataJSON: arrayBufferToBase64url(responseObj.clientDataJSON),
              attestationObject: arrayBufferToBase64url(responseObj.attestationObject),
              transports: typeof responseObj.getTransports === 'function' ? responseObj.getTransports() : []
            },
            clientExtensionResults: credential.getClientExtensionResults() || {}
          }
        }
      };

      // 5. Submit registration to backend
      const submitRes = await fetch('/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationPayload)
      });

      if (!submitRes.ok) {
        throw new Error('Verification failed: Backend rejected the credentials');
      }

      // 6. Complete
      setIsRegistering(false);
      setLabel('');
      await fetchCredentials();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Passkey registration failed');
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDeletePasskey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this passkey? You will not be able to log in with this key anymore.')) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`/webauthn/credentials/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete passkey record');
      await fetchCredentials();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const guessDeviceIcon = (labelName: string) => {
    const l = labelName.toLowerCase();
    if (l.includes('phone') || l.includes('mobile') || l.includes('android') || l.includes('ios') || l.includes('iphone')) {
      return Smartphone;
    }
    return Laptop;
  };

  if (loading && credentials.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mt-8">Checking Passkey Registrations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Key className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-slate-900 tracking-tight">Passkeys & Security Keys</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug truncate">
              Manage cryptographic passwordless credentials to log in using biometric verification or security keys.
            </p>
          </div>
          <button
            onClick={() => {
              setIsRegistering(true);
              setLabel('');
              setError(null);
            }}
            disabled={isRegistering}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-indigo-100"
          >
            <Plus className="w-3 h-3" /> Register Passkey
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm font-bold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Register Passkey Section */}
      {isRegistering && (
        <div className="bg-white rounded-[2rem] border border-indigo-200 p-8 shadow-2xl shadow-indigo-100/20 animate-slide-up relative overflow-hidden">
          <button
            onClick={() => setIsRegistering(false)}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <form onSubmit={handleRegisterPasskey} className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Register New Passkey</h3>
              <p className="text-xs font-bold text-slate-400">Give your key a descriptive name to easily identify it later</p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="key-label" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Name / Label</label>
              <input
                id="key-label"
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. My Laptop TouchID, YubiKey, Work Phone..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={registerLoading || !label.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-indigo-100"
              >
                {registerLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Continue</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List of Registered Passkeys */}
      <div className="grid gap-4">
        {credentials.map((cred) => {
          const DeviceIcon = guessDeviceIcon(cred.label);
          return (
            <div
              key={cred.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 flex items-center justify-between gap-6"
            >
              <div className="flex items-center gap-6 flex-1 w-full min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <DeviceIcon className="w-7 h-7" />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight truncate">{cred.label}</h3>
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" /> Passkey
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Registered: {new Date(cred.created).toLocaleDateString()}</span>
                    <span className="hidden sm:inline text-slate-200">|</span>
                    <span className="truncate max-w-[250px]">
                      Last Used: {cred.last_used ? new Date(cred.last_used).toLocaleString() : 'Never'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleDeletePasskey(cred.id)}
                disabled={actionLoadingId === cred.id}
                className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center shadow-sm shrink-0"
                title="Delete Passkey"
              >
                {actionLoadingId === cred.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}

        {credentials.length === 0 && !loading && (
          <div className="bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 p-12 text-center space-y-3 animate-fade-in">
            <Key className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-400 font-bold italic">No passkeys registered yet.</p>
            <p className="text-[10px] font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
              Register a passkey to authenticate quickly and securely using your device's biometric sensors (Touch ID, Face ID) or hardware security keys.
            </p>
          </div>
        )}
      </div>

      {/* Info Tip Panel */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 flex items-start gap-4 animate-fade-in">
        <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest font-black">How do Passkeys work?</p>
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
            Passkeys utilize secure asymmetric cryptography. Your device retains a private key locally (which never leaves your device), 
            and shares a corresponding public key with our server. To authenticate, your device signs a cryptographic challenge 
            using the local private key after you authorize it with biometrics (Face ID, Touch ID) or a local PIN. 
            This makes passkeys immune to phishing and credential database leaks.
          </p>
        </div>
      </div>
    </div>
  );
}
