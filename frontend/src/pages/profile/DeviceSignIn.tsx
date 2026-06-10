import { useState, useEffect } from 'react';
import { Smartphone, Laptop, Monitor, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface TrustedDevice {
    trustedDeviceId: number;
    loginUserId: number;
    deviceCd: number;
    deviceLocale: string | null;
    accessTypeCd: number;
    accessTypeLocale: string | null;
    deviceDescription: string;
    deviceIdentifier: string;
    platformName: string;
    platformVersion: string;
    clientName: string;
    clientVersion: string;
    trusted: boolean;
    firstSeenAt: string;
    lastSeenAt: string;
    startTime: string;
    endTime: string;
}

export default function DeviceSignIn() {
    const [devices, setDevices] = useState<TrustedDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                setLoading(true);
                const response = await fetch('/trusted-device');
                if (!response.ok) {
                    throw new Error('Failed to fetch trusted devices');
                }
                const data: TrustedDevice[] = await response.json();
                setDevices(data || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    const getDeviceIcon = (platformName: string) => {
        const p = platformName?.toLowerCase() || '';
        if (p.includes('mac') || p.includes('windows') || p.includes('linux')) return <Laptop className="w-6 h-6 text-indigo-600" />;
        if (p.includes('ios') || p.includes('android')) return <Smartphone className="w-6 h-6 text-indigo-600" />;
        return <Monitor className="w-6 h-6 text-indigo-600" />;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-200 p-24 text-center shadow-xl shadow-slate-200/40 animate-fade-in">
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-indigo-600/20 blur-xl animate-pulse rounded-full" />
                    <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin relative" />
                </div>
                <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs mt-8">Loading Devices...</p>
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
                    <p className="text-xl font-black tracking-tight">Failed to Load Devices</p>
                    <p className="text-sm font-bold text-red-600 mt-2 leading-relaxed opacity-80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in pb-12">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner shrink-0">
                    <Smartphone className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="text-base font-black text-slate-900 tracking-tight">Trusted Devices</h1>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                        Manage devices signed into your account
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-2xl shadow-slate-200/40">
                {devices.length === 0 ? (
                    <div className="text-center py-12">
                        <Monitor className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-400">No trusted devices found.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {devices.map((device) => {
                            const lastSeenDate = device.lastSeenAt ? new Date(device.lastSeenAt) : null;
                            const firstSeenDate = device.firstSeenAt ? new Date(device.firstSeenAt) : null;

                            return (
                                <div
                                    key={device.trustedDeviceId}
                                    className="group relative flex flex-col p-5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
                                            {getDeviceIcon(device.platformName)}
                                        </div>
                                        <div className="flex-1 min-w-0 w-full">
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <h3 className="text-sm font-black text-slate-900 truncate">
                                                    {device.clientName} on {device.platformName}
                                                </h3>
                                                {device.trusted && (
                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        Trusted
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">Device Type:</span>
                                                    <span className="text-slate-700 font-bold">{device.deviceLocale || 'Unknown'} (CD: {device.deviceCd})</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">Access Type:</span>
                                                    <span className="text-slate-700 font-bold">{device.accessTypeLocale || 'Unknown'} (CD: {device.accessTypeCd})</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">Platform:</span>
                                                    <span className="text-slate-700 font-bold">{device.platformName} {device.platformVersion}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">Client:</span>
                                                    <span className="text-slate-700 font-bold">{device.clientName} {device.clientVersion}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">Device Desc:</span>
                                                    <span className="text-slate-700 font-bold truncate max-w-[140px] sm:max-w-xs">{device.deviceDescription || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">Device Id:</span>
                                                    <span className="text-slate-700 font-bold truncate max-w-[120px] sm:max-w-[200px]" title={device.deviceIdentifier}>{device.deviceIdentifier}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">Last seen:</span>
                                                    <span className="text-slate-700 font-bold">
                                                        {lastSeenDate ? lastSeenDate.toLocaleString('en-US', {
                                                            month: 'short', day: 'numeric',
                                                            hour: 'numeric', minute: '2-digit', hour12: true
                                                        }) : 'Unknown'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-400 font-medium">First sign-in:</span>
                                                    <span className="text-slate-700 font-bold">
                                                        {firstSeenDate ? firstSeenDate.toLocaleString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric'
                                                        }) : 'Unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
