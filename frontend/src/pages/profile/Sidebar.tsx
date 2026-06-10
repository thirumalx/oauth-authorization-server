import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
    User, Mail, Phone, Lock, Globe, Shield,
    Smartphone, Fingerprint, Activity,
    AppWindow, LogIn, ChevronRight, MapPin, Key,
    Menu, X
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
            { name: 'Passkeys', path: 'passkeys', icon: Key },
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
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const currentPath = location.pathname.split('/').pop() || 'personal-info';
    
    const currentItem = navigation
        .flatMap(g => g.items)
        .find(item => item.path === currentPath) || navigation[0].items[0];

    // Close menu when route changes
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    return (
        <aside className="w-full lg:w-60 flex-shrink-0">
            {/* Mobile Navigation Trigger */}
            <div className="lg:hidden w-full mb-6 relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm hover:border-slate-300 active:scale-[0.99] transition-all"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <currentItem.icon className="w-4.5 h-4.5" />
                        </div>
                        <div className="text-left">
                            <span className="block text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Settings Section</span>
                            <span className="block text-sm font-extrabold text-slate-800 leading-tight">{currentItem.name}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">Menu</span>
                        {isOpen ? <X className="w-5 h-5 text-slate-500" /> : <Menu className="w-5 h-5 text-slate-500" />}
                    </div>
                </button>

                {/* Mobile Navigation Dropdown */}
                {isOpen && (
                    <>
                        {/* Backdrop to close */}
                        <div 
                            className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-[2px]" 
                            onClick={() => setIsOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto space-y-6">
                            {navigation.map((group) => (
                                <div key={group.title} className="space-y-2">
                                    <h3 className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                                        {group.title}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-1">
                                        {group.items.map((item) => (
                                            <NavLink
                                                key={item.path}
                                                to={item.path}
                                                className={({ isActive }) => `
                                                    group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
                                                    ${isActive
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}
                                                `}
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        <div className="flex items-center gap-3">
                                                            <item.icon className="w-4 h-4" />
                                                            <span className="text-xs font-bold tracking-tight">{item.name}</span>
                                                        </div>
                                                        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isActive ? 'rotate-90 opacity-100' : 'opacity-0 group-hover:opacity-40 group-hover:translate-x-1'}`} />
                                                    </>
                                                )}
                                            </NavLink>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Desktop Navigation (Visible on lg and larger screens) */}
            <nav className="hidden lg:block sticky top-24 space-y-8 pb-12">
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
