import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import {
    Users, Search, Plus, Mail, Phone, Calendar,
    ChevronLeft, ChevronRight, Edit3, Trash2,
    UserCircle, Hash, X, Check, ShieldCheck,
    ShieldAlert, RefreshCw, Layers, TrendingUp,
    Cpu
} from 'lucide-react';

interface UserResource {
    loginUuid: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    individual: boolean;
    accountCreatedOn: string;
}

interface LoginHistory {
    loginHistoryId: number;
    loginUserId: number;
    successLogin: boolean;
    rowCreatedOn: string;
    logoutTime: string | null;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);
    const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'corporate'>('all');

    // Drawer State
    const [selectedUser, setSelectedUser] = useState<UserResource | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Drawer Edit Form States
    const [editFirstName, setEditFirstName] = useState('');
    const [editLastName, setEditLastName] = useState('');
    const [editIndividual, setEditIndividual] = useState(true);

    // Delete Soft Simulation State
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/user?page=${page}&size=10&sortBy=rowCreatedOn&asc=false`);
            const data = await response.json();
            setUsers(data.userResources || []);
            setTotalUsers(data.count || 0);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    // Live calculations for overview grid metrics
    const personalCount = users.filter(u => u.individual).length;
    const corporateCount = users.filter(u => !u.individual).length;

    // Filter users dynamically based on active filter tab
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeTab === 'personal') {
            return matchesSearch && user.individual;
        } else if (activeTab === 'corporate') {
            return matchesSearch && !user.individual;
        }
        return matchesSearch;
    });

    const openDrawer = async (user: UserResource) => {
        setSelectedUser(user);
        setEditFirstName(user.firstName || '');
        setEditLastName(user.lastName || '');
        setEditIndividual(user.individual);
        setIsDrawerOpen(true);
        setSaveStatus('idle');

        // Fetch real login histories from backend
        setLoadingHistory(true);
        try {
            const response = await fetch(`/user/login-histories/${user.loginUuid}?page=1&size=10`);
            if (response.ok) {
                const data = await response.json();
                setLoginHistory(data.loginHistories || []);
            } else {
                setLoginHistory([]);
            }
        } catch (err) {
            console.error("Failed to load user history", err);
            setLoginHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => setSelectedUser(null), 300); // Wait for transition
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;

        setIsSaving(true);
        setSaveStatus('idle');

        const payload = {
            ...selectedUser,
            firstName: editFirstName,
            lastName: editLastName,
            individual: editIndividual
        };

        try {
            const response = await fetch('/user/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                setSaveStatus('success');
                // Refresh main list
                await fetchUsers();
                // Update selected user local view
                setSelectedUser(prev => prev ? { ...prev, firstName: editFirstName, lastName: editLastName, individual: editIndividual } : null);
                triggerToast("User information successfully updated");
                setTimeout(() => closeDrawer(), 1500);
            } else {
                setSaveStatus('error');
            }
        } catch (err) {
            console.error("Failed to update user", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const triggerToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Soft-delete simulated action
    const handleDeleteUser = (user: UserResource) => {
        triggerToast(`Removal simulation: Identity ${user.firstName} ${user.lastName} successfully detached.`);
    };

    return (
        <div className="page-background selection:bg-indigo-100 selection:text-indigo-900 min-h-screen bg-slate-50/50 pb-20 relative overflow-hidden">
            <Navbar />

            {/* Custom Toast Alert */}
            {toastMessage && (
                <div className="fixed bottom-6 right-6 z-50 p-4.5 bg-slate-900 text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800 animate-slide-in-right">
                    <div className="p-1.5 bg-indigo-500 rounded-lg flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-black tracking-tight">{toastMessage}</span>
                </div>
            )}

            <main className="max-w-8xl mx-auto px-0 mt-0">
                {/* Dashboard Controls Bar */}
                <div className="bg-white border border-slate-100 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col md:flex-row items-center justify-between gap-4">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Identity Registry</h2>
                    {/* Search Field */}
                    <div className="relative group w-full md:w-72">
                        <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                        <input
                            type="text"
                            placeholder="Quick search identity..."
                            className="bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-white outline-none transition-all w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* Filter Tabs & Create button */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="flex p-1.5 bg-slate-50 border border-slate-100 rounded-2xl w-full sm:w-auto shadow-inner">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-black transition-all ${activeTab === 'all' ? 'bg-white text-indigo-600 shadow-md scale-[1.01]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                All Users
                            </button>
                            <button
                                onClick={() => setActiveTab('personal')}
                                className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-black transition-all ${activeTab === 'personal' ? 'bg-white text-indigo-600 shadow-md scale-[1.01]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Personal
                            </button>
                            <button
                                onClick={() => setActiveTab('corporate')}
                                className={`flex-1 sm:flex-initial py-2.5 px-5 rounded-xl text-xs font-black transition-all ${activeTab === 'corporate' ? 'bg-white text-indigo-600 shadow-md scale-[1.01]' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                Corporate
                            </button>
                        </div>

                        <a href="/user/add" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black py-3.5 px-6.5 rounded-2xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] text-xs tracking-tight group shrink-0 w-full sm:w-auto">
                            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                            Create User
                        </a>
                    </div>
                </div>

                {/* Table Section */}
                <section className="bg-white border border-slate-100 shadow-[0_12px_40px_rgba(0,0,0,0.01)] transition-all overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/20">
                                    <th className="px-8 py-4.5">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                            <Hash className="w-3.5 h-3.5 opacity-55" />
                                            ID Reference
                                        </div>
                                    </th>
                                    <th className="px-8 py-4.5">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                            <UserCircle className="w-4 h-4 opacity-55" />
                                            User Identity
                                        </div>
                                    </th>
                                    <th className="px-8 py-4.5">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                            <Mail className="w-4 h-4 opacity-55" />
                                            Communication
                                        </div>
                                    </th>
                                    <th className="px-8 py-4.5">
                                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-00 uppercase tracking-widest">
                                            <Calendar className="w-4 h-4 opacity-55" />
                                            Registration Date
                                        </div>
                                    </th>
                                    <th className="px-8 py-4.5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/80">
                                {loading ? (
                                    [...Array(4)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-9 text-center">
                                                <div className="h-4.5 bg-slate-50 rounded-full w-3/4 mx-auto mb-3" />
                                                <div className="h-3.5 bg-slate-50 rounded-full w-1/2 mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-8 py-16 text-center text-slate-400 font-bold text-sm">
                                            No identities found matching the filters.
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr
                                        key={user.loginUuid}
                                        onClick={() => openDrawer(user)}
                                        className="group hover:bg-indigo-50/10 cursor-pointer transition-all duration-200"
                                    >
                                        <td className="px-8 py-5.5">
                                            <span className="px-3 py-1.5 bg-slate-50 border border-slate-100 text-slate-400 rounded-xl text-[9px] font-black font-mono tracking-tighter shadow-sm group-hover:bg-white transition-all">
                                                {user.loginUuid.split('-')[0].toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5.5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-all duration-300 select-none">
                                                    {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-tight mb-1 group-hover:text-indigo-600 transition-colors">{user.firstName} {user.lastName}</p>
                                                    <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${user.individual ? 'bg-indigo-50/70 text-indigo-600' : 'bg-emerald-50/70 text-emerald-600'}`}>
                                                        {user.individual ? 'Personal' : 'Corporate'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5.5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                    <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-[10.5px] font-bold text-slate-400">
                                                    <Phone className="w-3 h-3 text-slate-300" />
                                                    {user.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5.5">
                                            <div className="space-y-0.5">
                                                <p className="text-xs font-black text-slate-700">
                                                    {new Date(user.accountCreatedOn).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Auth Identity</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5.5 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => openDrawer(user)}
                                                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-md rounded-xl transition-all active:scale-90"
                                                    title="Edit Details"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user)}
                                                    className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-md rounded-xl transition-all active:scale-90"
                                                    title="Detatch Identity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="px-8 py-5 bg-slate-50/40 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                            Showing <span className="text-indigo-600">{filteredUsers.length}</span> of <span className="text-slate-800">{totalUsers}</span> registered profiles
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                            >
                                <ChevronLeft className="w-4.5 h-4.5" />
                            </button>
                            <span className="h-8.5 px-3 flex items-center justify-center bg-indigo-600 rounded-xl text-[11px] font-black text-white shadow-md shadow-indigo-500/10 min-w-[32px]">{page + 1}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={(page + 1) * 10 >= totalUsers}
                                className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95 disabled:hover:border-slate-200 disabled:hover:text-slate-500"
                            >
                                <ChevronRight className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    </div>
                </section>
            </main>

            {/* Slide-over Right Details Drawer */}
            {isDrawerOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Overlay */}
                    <div
                        onClick={closeDrawer}
                        className="fixed inset-0 bg-slate-950/30 backdrop-blur-sm animate-fade-in-overlay"
                    />

                    {/* Drawer Content */}
                    <div className="relative w-full max-w-lg bg-white h-full shadow-[0_0_80px_rgba(0,0,0,0.06)] border-l border-slate-100 flex flex-col animate-slide-in-right z-10">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100/50">
                                    <Users className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-slate-900 tracking-tight">Identity Details</h4>
                                    <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">UUID: {selectedUser.loginUuid.slice(0, 18)}...</p>
                                </div>
                            </div>
                            <button
                                onClick={closeDrawer}
                                className="p-2.5 hover:bg-slate-50 text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 rounded-xl transition-all active:scale-95"
                            >
                                <X className="w-4.5 h-4.5" />
                            </button>
                        </div>

                        {/* Drawer Body Scroll */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Profile Highlight Card */}
                            <div className="bg-gradient-to-tr from-slate-50 to-slate-50/20 rounded-3xl p-5 border border-slate-100 flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-base font-black shadow-md select-none shrink-0">
                                    {(selectedUser.firstName?.[0] || '') + (selectedUser.lastName?.[0] || '')}
                                </div>
                                <div className="space-y-1">
                                    <h5 className="text-base font-black text-slate-900">{selectedUser.firstName} {selectedUser.lastName}</h5>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${selectedUser.individual ? 'bg-indigo-100/60 text-indigo-600' : 'bg-emerald-100/60 text-emerald-600'}`}>
                                            {selectedUser.individual ? 'Personal Identity' : 'Corporate Identity'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Editing Details Section */}
                            <div className="space-y-4">
                                <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 border-b border-slate-50 pb-2">Profile Actions & Edit</h6>

                                {saveStatus === 'success' && (
                                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 flex items-center gap-3 animate-fade-in text-xs font-bold">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                                        <span>User updated successfully. Synchronizing...</span>
                                    </div>
                                )}

                                {saveStatus === 'error' && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-800 flex items-center gap-3 animate-fade-in text-xs font-bold">
                                        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
                                        <span>Failed to update user. Please check server logs.</span>
                                    </div>
                                )}

                                <form onSubmit={handleUpdateUser} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all shadow-sm"
                                                value={editFirstName}
                                                onChange={(e) => setEditFirstName(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                                            <input
                                                type="text"
                                                className="w-full bg-slate-50 border border-slate-100 focus:border-indigo-500 rounded-xl py-2.5 px-4 text-xs font-bold text-slate-900 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all shadow-sm"
                                                value={editLastName}
                                                onChange={(e) => setEditLastName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Toggle Classification */}
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification Override</label>
                                        <div className="flex gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl shadow-inner">
                                            <button
                                                type="button"
                                                onClick={() => setEditIndividual(true)}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${editIndividual ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Personal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditIndividual(false)}
                                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${!editIndividual ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                                            >
                                                Corporate
                                            </button>
                                        </div>
                                    </div>

                                    {/* Inline static user details */}
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-400">Email Address</span>
                                            <span className="font-bold text-slate-800">{selectedUser.email}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-400">Phone Connection</span>
                                            <span className="font-bold text-slate-800">{selectedUser.phoneNumber}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-400">Created At</span>
                                            <span className="font-bold text-slate-800">
                                                {new Date(selectedUser.accountCreatedOn).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2.5 transition-all text-xs active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isSaving ? (
                                            <>
                                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                                <span>Saving Changes...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                <span>Save Profile Details</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Timeline Activity History */}
                            <div className="space-y-4 pt-2">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Login Histories Audit</h6>
                                    <span className="text-[8.5px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">Security Log</span>
                                </div>

                                {loadingHistory ? (
                                    <div className="flex items-center justify-center py-10 gap-2 text-xs font-bold text-slate-400">
                                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
                                        <span>Loading audit trails...</span>
                                    </div>
                                ) : loginHistory.length === 0 ? (
                                    <div className="text-center py-10 text-slate-400 font-bold text-xs bg-slate-50/50 rounded-2xl border border-slate-100/50 border-dashed">
                                        No login history logs recorded.
                                    </div>
                                ) : (
                                    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                                        {loginHistory.map((log) => (
                                            <div key={log.loginHistoryId} className="relative group/time">
                                                {/* Timeline node */}
                                                <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white transition-colors duration-200 ${log.successLogin ? 'border-emerald-500 group-hover/time:bg-emerald-500' : 'border-red-500 group-hover/time:bg-red-500'}`} />

                                                <div className="space-y-1 pl-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${log.successLogin ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                            {log.successLogin ? 'Authorized Access' : 'Failure Threat'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">ID: #{log.loginHistoryId}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs">
                                                        <p className="font-bold text-slate-700">
                                                            {new Date(log.rowCreatedOn).toLocaleString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                                second: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    {log.logoutTime ? (
                                                        <p className="text-[10px] font-bold text-slate-400">
                                                            Logged out at {new Date(log.logoutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] font-black text-indigo-500 flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                                                            Active Session
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-slate-50 bg-slate-50/50 flex items-center justify-between shrink-0">
                            <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest">Authentication Provider</span>
                            <button
                                onClick={closeDrawer}
                                className="py-2.5 px-5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-black text-slate-700 shadow-sm active:scale-95 transition-all"
                            >
                                Dismiss Drawer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
