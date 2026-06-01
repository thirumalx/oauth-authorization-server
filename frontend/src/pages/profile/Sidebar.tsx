import { NavLink } from 'react-router-dom';
import {
    User, Mail, Phone, Lock, Globe, Shield,
    Smartphone, Fingerprint, Activity,
    AppWindow, LogIn, ChevronRight, MapPin
} from 'lucide-react';

const navigation = [
    {
        title: 'Profile',
        items: [
            { name: 'Personal Information', path: 'personal-info', icon: User },
            { name: 'Address', path: 'address', icon: MapPin },
            { name: 'Email Address', path: 'email', icon: Mail },
            { name: 'Mobile Number', path: 'mobile', icon: Phone },
        ]
    },
    {
        title: 'Security',
        items: [
            { name: 'Password', path: 'password', icon: Lock },
            { name: 'Geo-fencing', path: 'geo-fencing', icon: Globe },
            { name: 'Allowed IP Address', path: 'allowed-ip', icon: Shield },
            { name: 'Device Sign-in', path: 'device-signin', icon: Smartphone },
        ]
    },
    {
        title: 'Authentication',
        items: [
            { name: 'MFA', path: 'mfa', icon: Fingerprint },
        ]
    },
    {
        title: 'Session',
        items: [
            { name: 'Login Histories', path: 'activity-history', icon: Activity },
            { name: 'Connected App', path: 'connected-app', icon: AppWindow },
            { name: 'App Sign-in', path: 'app-signin', icon: LogIn },
        ]
    }
];

export default function Sidebar() {
    return (
        <aside className="w-full lg:w-60 flex-shrink-0">
            <nav className="sticky top-24 space-y-8 pb-12">
                {navigation.map((group) => (
                    <div key={group.title} className="space-y-3">
                        <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                            {group.title}
                        </h3>
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) => `
                                        group flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300
                                        ${isActive
                                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 translate-x-2'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}
                                    `}
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <item.icon className="w-5 h-5" />
                                                <span className="text-sm font-bold tracking-tight">{item.name}</span>
                                            </div>
                                            <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'rotate-90 opacity-100' : 'opacity-0 group-hover:opacity-40 group-hover:translate-x-1'}`} />
                                        </>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>
        </aside>
    );
}
