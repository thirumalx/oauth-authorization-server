import Navbar from './Navbar';
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './profile/Sidebar';
import { Fingerprint } from 'lucide-react';

export default function Profile() {
    const [profile, setProfile] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadProfile = async () => {
        try {
            const response = await fetch('/profile/personal-info', {
                headers: {
                    Accept: 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load profile: ${response.status}`);
            }

            const data = await response.json();
            setProfile(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Unable to load profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    return (
        <div className="page-background selection:bg-indigo-100 selection:text-indigo-900">
            <Navbar />

            <main className="page-main pt-12">
                <div className="w-full max-w-8xl mx-auto animate-fade-in space-y-6">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10 px-4">
                        <div className="p-5 rounded-[2rem] bg-indigo-600 shadow-2xl shadow-indigo-200 group hover:rotate-6 transition-all duration-500">
                            <Fingerprint className="w-6 h-6 text-white" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600">Account Management</p>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Settings</h1>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-12 relative z-10 min-h-[600px] items-start">
                        {/* Left Navigation */}
                        <Sidebar />

                        {/* Content Area */}
                        <div className="flex-1 w-full lg:min-w-0">
                            <Outlet context={{ profile, loading, error, refreshProfile: loadProfile }} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
