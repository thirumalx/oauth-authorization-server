import { useState, useEffect } from 'react';
import { 
  Fingerprint, Mail, MessageSquare, Bell, Key, Plus, Trash2, 
  AlertCircle, RefreshCw, X, ShieldCheck, CheckCircle2, ChevronRight, 
  HelpCircle, Star, QrCode, Copy, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface MfaConfig {
  mfaId: number;
  loginUserId: number;
  contactId: number | null;
  mfaCd: number; // 1 = Email, 2 = SMS, 3 = Push, 4 = TOTP
  secret: string | null;
  verified: boolean;
  primaryMfa: boolean;
  startTime: string | null;
  endTime: string | null;
}

interface ContactResource {
  contactId: number;
  loginId: string;
  verified: boolean;
  primary: boolean;
}

type AddStep = 'select_type' | 'configure_totp' | 'configure_channel' | 'success';

export default function MultifactorAuth() {
  const [mfaConfigs, setMfaConfigs] = useState<MfaConfig[]>([]);
  const [emails, setEmails] = useState<ContactResource[]>([]);
  const [phones, setPhones] = useState<ContactResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [addStep, setAddStep] = useState<AddStep>('select_type');
  const [selectedMfaCd, setSelectedMfaCd] = useState<number>(4); // Default: TOTP
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  
  // TOTP setup state
  const [totpSecret, setTotpSecret] = useState('');
  const [totpQrUri, setTotpQrUri] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  
  const [actionLoading, setActionLoading] = useState<number | null>(null); // mfaId or -1 for adding

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch MFA configurations
      const mfaRes = await fetch('/mfa');
      if (!mfaRes.ok) throw new Error('Failed to fetch MFA configurations');
      const mfaData: MfaConfig[] = await mfaRes.json();
      setMfaConfigs(mfaData);

      // Fetch verified emails & phones to let users configure them
      const emailRes = await fetch('/profile/email');
      const phoneRes = await fetch('/profile/phone-number');
      
      if (emailRes.ok) {
        const emailData: ContactResource[] = await emailRes.json();
        setEmails(emailData.filter(e => e.verified));
      }
      if (phoneRes.ok) {
        const phoneData: ContactResource[] = await phoneRes.json();
        setPhones(phoneData.filter(p => p.verified));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchTotpSetup = async () => {
    try {
      setActionLoading(-1);
      setVerificationError(null);
      const res = await fetch('/mfa/totp/setup');
      if (!res.ok) throw new Error('Failed to generate secure TOTP credentials');
      const data = await res.json();
      // Format secret with spaces for easier reading
      const formatted = data.secret.match(/.{1,4}/g)?.join(' ') || data.secret;
      setTotpSecret(formatted);
      setTotpQrUri(data.qrUri);
    } catch (err: any) {
      setVerificationError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartAddFlow = () => {
    setIsAdding(true);
    setAddStep('select_type');
    setSelectedMfaCd(4);
    setSelectedContactId('');
    setTotpCode('');
    setVerificationError(null);
  };

  const copySecretToClipboard = () => {
    navigator.clipboard.writeText(totpSecret.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMfaTypeSelect = () => {
    if (selectedMfaCd === 4) {
      setAddStep('configure_totp');
      fetchTotpSetup();
    } else {
      setAddStep('configure_channel');
      // Auto select first available verified contact
      if (selectedMfaCd === 1 && emails.length > 0) {
        setSelectedContactId(emails[0].contactId.toString());
      } else if (selectedMfaCd === 2 && phones.length > 0) {
        setSelectedContactId(phones[0].contactId.toString());
      } else {
        setSelectedContactId('');
      }
    }
  };

  const handleSaveMfa = async (verified: boolean = true) => {
    setActionLoading(-1);
    try {
      const payload: Partial<MfaConfig> = {
        mfaCd: selectedMfaCd,
        verified: verified,
        primaryMfa: mfaConfigs.length === 0, // Make primary if it's the first one
      };

      if (selectedMfaCd === 4) {
        payload.secret = totpSecret.replace(/\s/g, '');
        (payload as any).code = totpCode;
      } else if (selectedMfaCd === 1 || selectedMfaCd === 2) {
        payload.contactId = parseInt(selectedContactId, 10);
        // Find corresponding secret (which is the loginId/email/phone itself for reference)
        const contact = selectedMfaCd === 1 
          ? emails.find(e => e.contactId.toString() === selectedContactId)
          : phones.find(p => p.contactId.toString() === selectedContactId);
        payload.secret = contact ? contact.loginId : '';
      }

      const response = await fetch('/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let errorMsg = 'Failed to configure MFA method';
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch (e) {
          try {
            const txt = await response.text();
            if (txt) errorMsg = txt;
          } catch (e2) {}
        }
        throw new Error(errorMsg);
      }

      setAddStep('success');
      await fetchData();
    } catch (err: any) {
      throw err;
    } finally {
      setActionLoading(null);
    }
  };

  const handleVerifyTotp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totpCode.trim().length !== 6) {
      setVerificationError('Verification code must be 6 digits.');
      return;
    }
    setVerificationError(null);
    try {
      await handleSaveMfa(true);
    } catch (err: any) {
      setVerificationError(err.message);
    }
  };

  const handleSetPrimary = async (mfa: MfaConfig) => {
    setActionLoading(mfa.mfaId);
    try {
      const response = await fetch(`/mfa/${mfa.mfaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mfa,
          primaryMfa: true
        })
      });
      if (!response.ok) throw new Error('Failed to set primary MFA method');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteMfa = async (mfaId: number) => {
    if (!confirm('Are you sure you want to disable this MFA method?')) return;

    setActionLoading(mfaId);
    try {
      const response = await fetch(`/mfa/${mfaId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to disable MFA method');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const getMfaDetails = (mfaCd: number) => {
    switch (mfaCd) {
      case 1:
        return { 
          title: 'Email One-Time Password', 
          desc: 'Get an OTP code delivered securely to your verified inbox.', 
          icon: Mail, 
          color: 'text-indigo-600', 
          bg: 'bg-indigo-50' 
        };
      case 2:
        return { 
          title: 'SMS One-Time Password', 
          desc: 'Receive secure 6-digit access codes sent directly to your phone.', 
          icon: MessageSquare, 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50' 
        };
      case 3:
        return { 
          title: 'Push Notifications', 
          desc: 'Approve authentications instantly via mobile app notifications.', 
          icon: Bell, 
          color: 'text-sky-600', 
          bg: 'bg-sky-50' 
        };
      case 4:
      default:
        return { 
          title: 'Authenticator App (TOTP)', 
          desc: 'Generate verification codes using Google Authenticator, Microsoft, or similar.', 
          icon: Key, 
          color: 'text-violet-600', 
          bg: 'bg-violet-50' 
        };
    }
  };

  if (loading && mfaConfigs.length === 0) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
        <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
        <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mt-8">Establishing Secure MFA Context...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Fingerprint className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-slate-900 tracking-tight">Multifactor Authentication</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug truncate">
              Secure your account by adding standard multi-factor verification options.
            </p>
          </div>
          <button
            onClick={handleStartAddFlow}
            disabled={isAdding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shrink-0 shadow-md shadow-indigo-100"
          >
            <Plus className="w-3 h-3" /> Setup MFA
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-3 text-sm font-bold text-red-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Add MFA Section */}
      {isAdding && (
        <div className="bg-white rounded-[2rem] border border-indigo-200 p-8 shadow-2xl shadow-indigo-100/20 animate-slide-up relative overflow-hidden">
          <button
            onClick={() => setIsAdding(false)}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          {/* ─ STEP 1: Select Type ─ */}
          {addStep === 'select_type' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Select Authentication Channel</h3>
                <p className="text-xs font-bold text-slate-400">Choose your preferred multifactor channel type below</p>
              </div>

              <div className="grid gap-4">
                {[4, 1, 2].map((cd) => {
                  const details = getMfaDetails(cd);
                  const Icon = details.icon;
                  const isSelected = selectedMfaCd === cd;
                  return (
                    <div
                      key={cd}
                      onClick={() => setSelectedMfaCd(cd)}
                      className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-4 ${isSelected ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-100 hover:border-indigo-100 hover:bg-slate-50/50'}`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${details.bg} ${details.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900">{details.title}</p>
                        <p className="text-xs font-bold text-slate-400 mt-0.5 leading-snug">{details.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleMfaTypeSelect}
                className="w-full flex items-center justify-center gap-1.5 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                Continue Setup <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ─ STEP 2A: Configure TOTP ─ */}
          {addStep === 'configure_totp' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Configure Authenticator App</h3>
                <p className="text-xs font-bold text-slate-400">Scan the QR code or enter the secret manually</p>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center bg-slate-50 border border-slate-100 p-6 rounded-3xl">
                <div className="w-32 h-32 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center relative shrink-0 overflow-hidden shadow-inner group p-2">
                  {totpQrUri ? (
                    <QRCodeSVG value={totpQrUri} size={112} level="M" />
                  ) : (
                    <QrCode className="w-24 h-24 text-slate-300 animate-pulse" />
                  )}
                  <div className="absolute inset-0 bg-indigo-600/95 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center rounded-xl cursor-default">
                    <QrCode className="w-8 h-8 mb-1" />
                    <span className="text-[9px] font-black uppercase tracking-wider leading-none">Scan with Authenticator App</span>
                  </div>
                </div>

                <div className="space-y-4 flex-1 w-full min-w-0">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuration Secret</p>
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5">
                      <span className="text-xs font-black text-indigo-600 tracking-wider truncate flex-1">{totpSecret}</span>
                      <button
                        onClick={copySecretToClipboard}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all shrink-0"
                        title="Copy Secret"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 mt-1 leading-snug">
                      1. Open your authenticator app (e.g. Google Authenticator, Microsoft Authenticator, Authy).<br/>
                      2. Add a new account and choose to scan QR or input key.<br/>
                      3. Input the secret code shown above.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleVerifyTotp} className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verify Registration</p>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    inputMode="numeric"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter the 6-digit app code (e.g., 123456)..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-center text-xl font-black tracking-[0.25em] text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                  />
                </div>

                {verificationError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold">{verificationError}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setAddStep('select_type')}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === -1 || totpCode.trim().length < 6}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                  >
                    {actionLoading === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verify & Enable'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─ STEP 2B: Configure OTP Channels (Email/SMS) ─ */}
          {addStep === 'configure_channel' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {selectedMfaCd === 1 ? 'Configure Email OTP' : 'Configure SMS OTP'}
                </h3>
                <p className="text-xs font-bold text-slate-400">
                  Select a verified {selectedMfaCd === 1 ? 'email address' : 'mobile number'} to bind this MFA channel.
                </p>
              </div>

              {((selectedMfaCd === 1 && emails.length === 0) || (selectedMfaCd === 2 && phones.length === 0)) ? (
                <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5 text-amber-800">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">No Verified Channels Available</span>
                  </div>
                  <p className="text-xs font-bold text-amber-700 leading-relaxed">
                    You do not have any verified {selectedMfaCd === 1 ? 'email addresses' : 'mobile numbers'} configured. 
                    Please add and verify a channel in the respective section of your profile first.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Target</label>
                    <select
                      value={selectedContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                    >
                      {selectedMfaCd === 1 
                        ? emails.map(e => <option key={e.contactId} value={e.contactId}>{e.loginId}</option>)
                        : phones.map(p => <option key={p.contactId} value={p.contactId}>{p.loginId}</option>)
                      }
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAddStep('select_type')}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                >
                  Back
                </button>
                <button
                  onClick={async () => {
                    try {
                      await handleSaveMfa(true);
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  disabled={actionLoading === -1 || !selectedContactId}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {actionLoading === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Register & Enable'}
                </button>
              </div>
            </div>
          )}

          {/* ─ STEP 3: Success Screen ─ */}
          {addStep === 'success' && (
            <div className="text-center space-y-6 py-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-lg font-black text-slate-900">MFA Setup Successful!</p>
                <p className="text-sm font-bold text-slate-400">
                  Your new authentication channel has been verified and registered.
                </p>
              </div>
              <button
                onClick={() => setIsAdding(false)}
                className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" /> Go to Dashboard
              </button>
            </div>
          )}
        </div>
      )}

      {/* MFA List */}
      <div className="grid gap-4">
        {mfaConfigs.map((mfa) => {
          const details = getMfaDetails(mfa.mfaCd);
          const Icon = details.icon;
          return (
            <div
              key={mfa.mfaId}
              className={`bg-white rounded-3xl border transition-all lg:pr-10 border-slate-200 p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 flex flex-col md:flex-row items-center justify-between gap-6`}
            >
              <div className="flex items-center gap-6 flex-1 w-full">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${details.bg} ${details.color}`}>
                  <Icon className="w-7 h-7" />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight">{details.title}</h3>
                    {mfa.primaryMfa && (
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-indigo-700" /> Primary
                      </span>
                    )}
                    {mfa.verified ? (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-emerald-100">
                        <ShieldCheck className="w-2.5 h-2.5" /> Active
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 border border-amber-100">
                        <AlertCircle className="w-2.5 h-2.5" /> Pending Verify
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {mfa.secret && (
                      <span className="truncate max-w-[200px] normal-case text-slate-600 font-black">
                        {mfa.mfaCd === 4 ? `Secret: ${mfa.secret.slice(0, 4)}...${mfa.secret.slice(-4)}` : mfa.secret}
                      </span>
                    )}
                    {mfa.secret && <span className="text-slate-200">|</span>}
                    <span>
                      Registered: {mfa.startTime ? new Date(mfa.startTime).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {!mfa.primaryMfa && mfa.verified && (
                  <button
                    onClick={() => handleSetPrimary(mfa)}
                    disabled={actionLoading === mfa.mfaId}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                  >
                    {actionLoading === mfa.mfaId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><Star className="w-3.5 h-3.5" /> Set Primary</>}
                  </button>
                )}
                
                <button
                  onClick={() => handleDeleteMfa(mfa.mfaId)}
                  disabled={actionLoading === mfa.mfaId}
                  className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center shadow-sm shrink-0"
                  title="Remove MFA Channel"
                >
                  {actionLoading === mfa.mfaId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}

        {mfaConfigs.length === 0 && !loading && (
          <div className="bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 p-12 text-center space-y-3">
            <Fingerprint className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-400 font-bold italic">No multifactor authentication methods configured yet.</p>
            <p className="text-[10px] font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
              We highly recommend setting up at least one MFA method, such as an Authenticator app, to secure your account.
            </p>
          </div>
        )}
      </div>

      {/* Info Tip Panel */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 flex items-start gap-4 animate-fade-in">
        <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-black text-slate-700 uppercase tracking-widest">Why use Multi-Factor Authentication?</p>
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed">
            Multi-Factor Authentication (MFA) adds an essential extra layer of security. By requiring two or more independent factors 
            to verify your identity (something you know, like a password, and something you have, like your mobile phone or authenticator app), 
            it protects against unauthorized access, even in the event of password compromises.
          </p>
        </div>
      </div>
    </div>
  );
}
