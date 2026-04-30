import { useState, useEffect } from 'react';
import { Mail, Plus, Trash2, CheckCircle, AlertCircle, RefreshCw, X, ShieldCheck, MailPlus, Edit3, Save } from 'lucide-react';

interface ContactResource {
    contactId: number;
    loginId: string;
    verified: boolean;
    primary: boolean;
}

export default function EmailAddress() {
    const [emails, setEmails] = useState<ContactResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [actionLoading, setActionLoading] = useState<number | null>(null); // contactId or -1 for adding

    const fetchEmails = async () => {
        try {
            setLoading(true);
            const response = await fetch('/profile/email');
            if (!response.ok) throw new Error('Failed to fetch email addresses');
            const data = await response.json();
            setEmails(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const handleAddEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;
        
        setActionLoading(-1);
        try {
            const response = await fetch('/profile/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newEmail })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add email');
            }
            setNewEmail('');
            setIsAdding(false);
            await fetchEmails();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateEmail = async (contactId: number) => {
        if (!editValue || editValue === emails.find(e => e.contactId === contactId)?.loginId) {
            setEditingId(null);
            return;
        }

        setActionLoading(contactId);
        try {
            const response = await fetch(`/profile/email/${contactId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: editValue })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update email');
            }
            setEditingId(null);
            await fetchEmails();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteEmail = async (contactId: number) => {
        if (!confirm('Are you sure you want to remove this email address?')) return;
        
        setActionLoading(contactId);
        try {
            const response = await fetch(`/profile/email/${contactId}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete email');
            await fetchEmails();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const startEditing = (email: ContactResource) => {
        setEditingId(email.contactId);
        setEditValue(email.loginId);
    };

    if (loading && emails.length === 0) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
                <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mt-8">Retrieving Secure Communication Channels...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 relative">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 relative">
                        <Mail className="w-4 h-4" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                            <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-black text-slate-900 tracking-tight">Email Addresses</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug truncate">
                            Manage your email addresses for notifications, recovery and identity verification.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shrink-0 ${isAdding ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}
                    >
                        {isAdding ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Email</>}
                    </button>
                </div>
            </div>

            {/* Add Email Form */}
            {isAdding && (
                <div className="bg-white rounded-[2rem] border-2 border-dashed border-indigo-200 p-8 shadow-2xl shadow-indigo-100/20 animate-slide-up">
                    <form onSubmit={handleAddEmail} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="email"
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter your new email address..."
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={actionLoading === -1}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {actionLoading === -1 ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><MailPlus className="w-4 h-4" /> Authorize Email</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Email List */}
            <div className="grid gap-4">
                {emails.map((email) => (
                    <div 
                        key={email.contactId}
                        className={`bg-white rounded-3xl border transition-all group lg:pr-10 ${editingId === email.contactId ? 'border-indigo-400 shadow-2xl shadow-indigo-100 p-8' : 'border-slate-200 p-6 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5'} flex flex-col md:flex-row items-center justify-between gap-6`}
                    >
                        <div className="flex items-center gap-6 flex-1 w-full">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${email.verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {email.verified ? <CheckCircle className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                            </div>
                            
                            <div className="space-y-1 flex-1">
                                {editingId === email.contactId ? (
                                    <div className="flex flex-col gap-2">
                                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Update Email Address</p>
                                        <input 
                                            autoFocus
                                            type="email"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-black text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-black text-slate-900 tracking-tight">{email.loginId}</h3>
                                            {email.primary && (
                                                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-widest">Primary</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                                            <span className={email.verified ? 'text-emerald-600' : 'text-amber-600'}>
                                                {email.verified ? 'Verified Identity' : 'Pending Verification'}
                                            </span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-slate-400 tracking-tighter">System Managed</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {editingId === email.contactId ? (
                                <>
                                    <button 
                                        onClick={() => handleUpdateEmail(email.contactId)}
                                        disabled={actionLoading === email.contactId}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {actionLoading === email.contactId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Save</>}
                                    </button>
                                    <button 
                                        onClick={() => setEditingId(null)}
                                        className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <>
                                    {!email.verified && (
                                        <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-600 transition-all">
                                            Verify
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => startEditing(email)}
                                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all flex items-center justify-center shadow-sm"
                                        title="Edit Email"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    {!email.primary && (
                                        <button 
                                            onClick={() => handleDeleteEmail(email.contactId)}
                                            disabled={actionLoading === email.contactId}
                                            className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all flex items-center justify-center shadow-sm"
                                            title="Remove Email"
                                        >
                                            {actionLoading === email.contactId ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {emails.length === 0 && !loading && (
                    <div className="bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 p-12 text-center">
                        <p className="text-slate-400 font-bold italic">No auxiliary email addresses found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
