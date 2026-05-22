import { useState, useEffect } from 'react';
import Navbar from './Navbar';
import { Users, Search, Plus, Mail, Phone, Calendar, ChevronLeft, ChevronRight, Edit3, Trash2, UserCircle, Hash } from 'lucide-react';

interface UserResource {
    loginUuid: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    individual: boolean;
    accountCreatedOn: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [totalUsers, setTotalUsers] = useState(0);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/user?page=${page}&size=10&sortBy=rowCreatedOn&asc=false`);
            const data = await response.json();
            setUsers(data.userResources);
            setTotalUsers(data.count);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page]);

    const filteredUsers = users.filter(user =>
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-background selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />
            <main className="page-main pt-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Identity Management</h4>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors duration-200" />
                            <input
                                type="text"
                                placeholder="Search identity..."
                                className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all w-72 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <a href="/user/add" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-[0.98] text-sm tracking-tight group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                            Create User
                        </a>
                    </div>
                </div>

                {/* Table Section */}
                <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/40 transition-all overflow-hidden relative">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50 bg-slate-50/30">
                                    <th className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Hash className="w-3.5 h-3.5 opacity-50" />
                                            ID
                                        </div>
                                    </th>
                                    <th className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <UserCircle className="w-4 h-4 opacity-50" />
                                            Identity
                                        </div>
                                    </th>
                                    <th className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Mail className="w-4 h-4 opacity-50" />
                                            Communication
                                        </div>
                                    </th>
                                    <th className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Calendar className="w-4 h-4 opacity-50" />
                                            Registration
                                        </div>
                                    </th>
                                    <th className="px-8 py-5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-10 text-center">
                                                <div className="h-4 bg-slate-50 rounded-full w-3/4 mx-auto mb-4" />
                                                <div className="h-4 bg-slate-50 rounded-full w-1/2 mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.loginUuid} className="group hover:bg-slate-50/50 transition-all duration-200">
                                        <td className="px-8 py-6">
                                            <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black font-mono tracking-tighter shadow-sm">
                                                {user.loginUuid.split('-')[0].toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xl shadow-indigo-100 group-hover:scale-[1.15] group-hover:rotate-3 transition-all duration-300">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-slate-900 leading-tight mb-1">{user.firstName} {user.lastName}</p>
                                                    <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest bg-indigo-50 inline-block px-2 py-0.5 rounded-md">
                                                        {user.individual ? 'Personal' : 'Corporate'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2 text-[13px] font-bold text-slate-600 hover:text-indigo-600 cursor-pointer transition-colors">
                                                    <Mail className="w-4 h-4 text-slate-300 group-hover:text-indigo-300 transition-colors" />
                                                    {user.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                                    <Phone className="w-3.5 h-3.5 opacity-50" />
                                                    {user.phoneNumber}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-slate-700">
                                                    {new Date(user.accountCreatedOn).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Standard Identity</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 rounded-2xl transition-all active:scale-90">
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:shadow-xl hover:shadow-red-500/10 rounded-2xl transition-all active:scale-90">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Pagination */}
                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Exposing <span className="text-indigo-600 font-black">{filteredUsers.length}</span> of <span className="text-slate-900">{totalUsers}</span> identities
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                                disabled={page === 0}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-25 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="min-w-[40px] h-10 flex items-center justify-center bg-indigo-600 rounded-xl text-xs font-black text-white shadow-lg shadow-indigo-100">{page + 1}</span>
                            <button
                                onClick={() => setPage(p => p + 1)}
                                disabled={(page + 1) * 10 >= totalUsers}
                                className="p-2.5 bg-white border border-slate-200 rounded-xl disabled:opacity-25 text-slate-600 hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-sm active:scale-95"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
