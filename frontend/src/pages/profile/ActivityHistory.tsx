import { useState, useEffect } from 'react';
import { Clock, ShieldCheck, ShieldAlert, LogIn, LogOut, AlertCircle, RefreshCw, Activity, ChevronLeft, ChevronRight, Globe } from 'lucide-react';


interface TrustedDevice {
    trustedDeviceId: number;
    deviceCd?: number;
    accessTypeCd?: number;
    deviceDescription: string;
    deviceIdentifier: string;
    platformName: string;
    platformVersion: string;
    clientName: string;
    clientVersion: string;
    trusted: boolean;
}

interface LoginHistory {
    loginHistoryId: number;
    loginUserId: number;
    successLogin: boolean;
    ipAddress: string | null;
    rowCreatedOn: string;
    logoutTime: string | null;
    trustedDevice?: TrustedDevice | null;
}

interface PaginatedLoginHistory {
    loginHistories: LoginHistory[];
    count: number;
}

export default function ActivityHistory() {
    const [history, setHistory] = useState<LoginHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/user/login-histories?page=${page}&size=${pageSize}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch activity history');
                }
                const data: PaginatedLoginHistory = await response.json();
                setHistory(data.loginHistories || []);
                setTotalRecords(data.count || 0);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [page]);

    if (loading) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-xl animate-pulse rounded-full" />
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin relative" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mt-8">Loading Activity...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-red-700 flex items-start gap-6 shadow-2xl shadow-red-200/20 animate-fade-in">
                <div className="p-3 bg-white rounded-2xl shadow-sm filter drop-shadow-sm">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <p className="text-xl font-black tracking-tight">Failed to Load History</p>
                    <p className="text-sm font-bold text-red-600 mt-2 leading-relaxed opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner shrink-0">
                    <Activity className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-base font-black text-slate-900 tracking-tight">Login histories</h1>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Recent sign-ins and session events
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/40">
                {history.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400">No login history found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((record) => {
                            const loginDate = record.rowCreatedOn ? new Date(record.rowCreatedOn) : null;
                            const logoutDate = record.logoutTime ? new Date(record.logoutTime) : null;

                            return (
                                <div
                                    key={record.loginHistoryId}
                                    className="group relative flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                                >
                                    {/* Status Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform group-hover:scale-110 ${record.successLogin
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                            : 'bg-red-50 border-red-100 text-red-600'
                                        }`}>
                                        {record.successLogin ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                                    </div>

                                    {/* Timeline Details */}
                                    <div className="flex-1 min-w-0 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-black text-slate-900">
                                                    {record.successLogin ? 'Successful Sign-in' : 'Failed Attempt'}
                                                </p>
                                                {!record.successLogin && (
                                                    <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 text-[8px] font-black uppercase tracking-wider">
                                                        Blocked
                                                    </span>
                                                )}
                                            </div>
                                            {record.trustedDevice && (
                                                <div className="mt-1 space-y-1">
                                                    <p className="text-xs font-bold text-slate-700">
                                                        {record.trustedDevice.clientName} {record.trustedDevice.clientVersion && `v${record.trustedDevice.clientVersion}`} on {record.trustedDevice.platformName} {record.trustedDevice.platformVersion && `v${record.trustedDevice.platformVersion}`}
                                                    </p>
                                                    <p className="text-[10px] font-medium text-slate-500 flex flex-wrap items-center gap-1.5">
                                                        {record.trustedDevice.deviceDescription && <span>{record.trustedDevice.deviceDescription} •</span>}
                                                        <span>ID: <span className="font-mono">{record.trustedDevice.deviceIdentifier}</span></span>
                                                        {record.trustedDevice.deviceCd !== undefined && <span>• Dev CD: {record.trustedDevice.deviceCd}</span>}
                                                        {record.trustedDevice.accessTypeCd !== undefined && <span>• Acc CD: {record.trustedDevice.accessTypeCd}</span>}
                                                        {record.trustedDevice.trusted && <span className="ml-1 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded uppercase tracking-wider">Trusted</span>}
                                                    </p>
                                                </div>
                                            )}
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-xs font-bold text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                                                    <span className="text-slate-400 font-medium">Login:</span>
                                                    <span className="text-slate-700">
                                                        {loginDate ? loginDate.toLocaleString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric',
                                                            hour: 'numeric', minute: '2-digit', hour12: true
                                                        }) : 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <LogOut className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="text-slate-400 font-medium">Logout:</span>
                                                    <span className="text-slate-700">
                                                        {logoutDate ? logoutDate.toLocaleString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric',
                                                            hour: 'numeric', minute: '2-digit', hour12: true
                                                        }) : '-'}
                                                    </span>
                                                </div>
                                                {record.ipAddress && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="text-slate-400 font-medium">IP:</span>
                                                        <span className="text-slate-700">{record.ipAddress}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Tag */}
                                        <div className="hidden sm:block text-right">
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                ID: {record.loginHistoryId}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {history.length > 0 && (
                    <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalRecords)} of {totalRecords}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-[10px] font-black text-slate-600 px-2">Page {page} of {Math.ceil(totalRecords / pageSize) || 1}</span>
                            <button
                                onClick={() => setPage(p => Math.min(Math.ceil(totalRecords / pageSize) || 1, p + 1))}
                                disabled={page >= Math.ceil(totalRecords / pageSize) || totalRecords === 0}
                                className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
