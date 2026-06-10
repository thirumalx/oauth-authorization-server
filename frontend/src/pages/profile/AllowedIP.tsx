import { useState, useEffect } from 'react';
import { 
  Shield, Globe, Plus, Trash2, AlertCircle, RefreshCw, X, 
  HelpCircle, Info, Calendar, Terminal, ShieldAlert
} from 'lucide-react';

interface AllowedIpConfig {
  allowedIpId: number;
  loginUserId: number;
  id: string; // client id
  ipRange: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string | null;
  clientName: string | null;
  clientId: string | null;
}

interface ClientResource {
  id: string;
  client_name: string;
  client_id: string;
}

export default function AllowedIP() {
  const [ips, setIps] = useState<AllowedIpConfig[]>([]);
  const [clients, setClients] = useState<ClientResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add rule state
  const [isAdding, setIsAdding] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [ipRangeInput, setIpRangeInput] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null); // -1 for adding, mfaId for deleting

  // Explanatory accordions
  const [showCidrGuide, setShowCidrGuide] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch Allowed IPs
      const ipsRes = await fetch('/allowed-ip');
      if (!ipsRes.ok) throw new Error('Failed to fetch Allowed IP configurations');
      const ipsData: AllowedIpConfig[] = await ipsRes.json();
      setIps(ipsData);

      // Fetch Registered OAuth2 Clients
      const clientsRes = await fetch('/client');
      if (clientsRes.ok) {
        const clientsData: ClientResource[] = await clientsRes.json();
        setClients(clientsData);
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

  const handleOpenAddFlow = () => {
    setIsAdding(true);
    setSelectedClientId(clients.length > 0 ? clients[0].id : '');
    setIpRangeInput('');
    setValidationError(null);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipRangeInput.trim()) {
      setValidationError('Please enter a valid IP address or CIDR range.');
      return;
    }

    setActionLoading(-1);
    setValidationError(null);

    try {
      const response = await fetch('/allowed-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedClientId || null, // Can be null if it applies globally or is not bound
          ipRange: ipRangeInput.trim()
        })
      });

      if (!response.ok) {
        let msg = 'Failed to register IP whitelist rule';
        try {
          const errJson = await response.json();
          if (errJson && errJson.message) msg = errJson.message;
        } catch (err) {}
        throw new Error(msg);
      }

      setIsAdding(false);
      await fetchData();
    } catch (err: any) {
      setValidationError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteRule = async (allowedIpId: number) => {
    if (!confirm('Are you sure you want to delete this IP range restriction? Any request from outside this range will no longer be locked out.')) {
      return;
    }

    setActionLoading(allowedIpId);
    try {
      const response = await fetch(`/allowed-ip/${allowedIpId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete Allowed IP range');
      await fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-3 relative">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black text-slate-900 tracking-tight">Allowed IP Addresses</h1>
            <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug truncate">
              Restrict access to your OAuth2 Clients based on secure Classless Inter-Domain Routing (CIDR) ranges.
            </p>
          </div>
          <button
            onClick={handleOpenAddFlow}
            disabled={isAdding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shrink-0 shadow-md shadow-indigo-100"
          >
            <Plus className="w-3 h-3" /> Whitelist IP
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

      {/* Add IP modal section */}
      {isAdding && (
        <div className="bg-white rounded-[2rem] border border-indigo-200 p-8 shadow-2xl shadow-indigo-100/20 animate-slide-up relative overflow-hidden">
          <button
            onClick={() => setIsAdding(false)}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Configure Whitelisted Range</h3>
              <p className="text-xs font-bold text-slate-400">Lock down client requests to explicit CIDR blocks</p>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-5">
              {/* Client Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  Bound OAuth2 Client <span title="Which client does this whitelist apply to?"><Info className="w-3 h-3 text-slate-300" /></span>
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-xs font-black text-slate-700 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                >
                  <option value="">Global Restriction (All Clients)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.client_name} ({c.client_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* IP Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  IP Address or CIDR Range
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.168.1.0/24 or 10.0.0.1"
                  value={ipRangeInput}
                  onChange={(e) => setIpRangeInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-black text-indigo-600 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 placeholder:font-normal"
                />
                <p className="text-[9px] font-bold text-slate-400 flex items-center gap-1.5 mt-1 leading-snug">
                  <Terminal className="w-3 h-3 text-indigo-500 shrink-0" /> Tip: Single IP inputs (e.g. 192.168.1.1) will automatically suffix /32.
                </p>
              </div>

              {/* Validation Error */}
              {validationError && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold leading-relaxed">{validationError}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 py-3.5 bg-slate-100 text-slate-600 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === -1}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 shadow-md shadow-indigo-100"
                >
                  {actionLoading === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Apply Restriction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CIDR Notation Guide Accordion */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-indigo-100 transition-all">
        <button
          onClick={() => setShowCidrGuide(!showCidrGuide)}
          className="w-full flex items-center justify-between p-5 text-left font-black text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            Quick Guide: What is CIDR & IP Whitelisting?
          </span>
          <span className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 transition-colors">
            {showCidrGuide ? 'Hide Details ─' : 'Show Details +'}
          </span>
        </button>

        {showCidrGuide && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-4 animate-fade-in text-[10px] font-bold text-slate-500 leading-relaxed">
            <p>
              CIDR (Classless Inter-Domain Routing) allows you to define custom network sizes by allocating IP ranges. 
              The slash suffix (e.g. <code className="text-indigo-600 font-black">/24</code>) dictates the width of the network prefix mask:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-1">
                <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Single Host (/32)</span>
                <p className="text-slate-900 font-black text-xs">192.168.1.25/32</p>
                <p className="text-[9px] leading-tight">Restricts access to one exact IPv4 address. Very secure for a single servers static IP.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-1">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Small Range (/24)</span>
                <p className="text-slate-900 font-black text-xs">10.0.0.0/24</p>
                <p className="text-[9px] leading-tight">Includes all 256 IPs between <code className="normal-case">10.0.0.0</code> and <code className="normal-case">10.0.0.255</code>. Great for office LANs.</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-1">
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">Large Range (/16)</span>
                <p className="text-slate-900 font-black text-xs">172.16.0.0/16</p>
                <p className="text-[9px] leading-tight">Includes 65,536 distinct IPs from <code className="normal-case">172.16.0.0</code> to <code className="normal-case">172.16.255.255</code>. Used for corporate intranets.</p>
              </div>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-black text-indigo-900 uppercase tracking-widest">Important Safety Notice</span>
                <p className="text-[9px] leading-normal text-indigo-700">
                  Whitelisting an IP limits operations. If you add a range that does not cover your current device IP address, 
                  subsequent OAuth2 login requests under the specified bound clients will be rejected. Always make sure your corporate static range is fully included.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Allowed IP List */}
      <div className="grid gap-4">
        {ips.map((ip) => (
          <div
            key={ip.allowedIpId}
            className="bg-white rounded-3xl border border-slate-200 p-6 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-5 flex-1 w-full min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>

              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{ip.ipRange}</h3>
                  {ip.clientName ? (
                    <span className="px-2.5 py-1 bg-violet-50 border border-violet-100 text-violet-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {ip.clientName}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      All Clients
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-400 leading-none">
                  {ip.clientId && (
                    <>
                      <span className="truncate max-w-[150px] normal-case text-slate-600 font-black">
                        Client ID: {ip.clientId}
                      </span>
                      <span className="text-slate-200">|</span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    Whitelisted: {ip.createdAt ? new Date(ip.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => handleDeleteRule(ip.allowedIpId)}
                disabled={actionLoading === ip.allowedIpId}
                className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center shadow-sm shrink-0"
                title="Remove IP Restriction"
              >
                {actionLoading === ip.allowedIpId ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}

        {ips.length === 0 && !loading && (
          <div className="bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 p-12 text-center space-y-3">
            <Globe className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-400 font-bold italic">No IP Address restrictions defined.</p>
            <p className="text-[10px] font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your OAuth2 clients can currently be accessed from any IP address globally. Add rules to restrict access.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
