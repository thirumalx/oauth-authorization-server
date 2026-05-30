import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, User as UserIcon, Code, Mail, LogOut, X, Github, Linkedin, Globe, Phone } from 'lucide-react';

export default function Navbar() {
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);

    const Modal = ({ isOpen, onClose, title, icon: Icon, children, colorClass }: any) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-slate-950/40 backdrop-blur-md animate-fade-in-overlay">
                <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.08)] border border-slate-100 w-full max-w-2xl relative overflow-hidden animate-slide-in-right">
                    {/* Header */}
                    <div className="flex items-center justify-between p-2 border-b border-slate-50">
                        <div className="flex items-center gap-2">
                            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-center">
                                <Icon className={`w-6 h-6 ${colorClass}`} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Application Directory</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100 active:scale-95">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {/* Body */}
                    <div className="p-8">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-8xl mx-auto px-0 pt-0">
            <nav className="bg-white/80 backdrop-blur-xl border border-slate-100 px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-300">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/user" className="flex items-center gap-3.5 group">
                        <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-[6deg] transition-all duration-500">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">Auth Server</span>
                    </Link>

                    {/* Navigation Actions */}
                    <div className="hidden md:flex items-center gap-1.5">
                        <Link to="/user" className="flex items-center gap-2 px-4.5 py-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-indigo-100/30">
                            <Home className="w-4 h-4" />
                            Home
                        </Link>
                        <button onClick={() => setIsServicesOpen(true)} className="flex items-center gap-2 px-4.5 py-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-indigo-100/30">
                            <Code className="w-4 h-4" />
                            Services
                        </button>
                        <button onClick={() => setIsContactOpen(true)} className="flex items-center gap-2 px-4.5 py-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-indigo-100/30">
                            <Mail className="w-4 h-4" />
                            Contact
                        </button>

                        <div className="w-px h-6 bg-slate-100 mx-2" />

                        <div className="flex items-center gap-2">
                            <Link to="/profile/personal-info" className="flex items-center gap-2 px-4.5 py-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-2xl transition-all font-bold text-sm border border-transparent hover:border-indigo-100/30">
                                <UserIcon className="w-4.5 h-4.5" /> My Profile
                            </Link>
                            <a href="/logout" className="flex items-center gap-2 px-5 py-2.5 bg-red-50/30 hover:bg-red-50 text-red-500 border border-red-100/30 hover:border-red-100 rounded-2xl transition-all shadow-sm group font-bold text-sm">
                                <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                                <span>Logout</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Services Modal */}
            <Modal isOpen={isServicesOpen} onClose={() => setIsServicesOpen(false)} title="Projects & Services" icon={Code} colorClass="text-emerald-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[
                        { title: 'OAuth Server', desc: 'Modern OAuth2.1 Authorization Server with spring-security', link: 'https://github.com/thirumalx/oauth-authorization-server' },
                        { title: 'Resource Server', desc: 'Secure API Resource Server implementation with token verification', link: 'https://github.com/thirumalx' }
                    ].map((svc, i) => (
                        <div key={i} className="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl hover:bg-indigo-50/20 hover:border-indigo-100 hover:shadow-md transition-all group">
                            <h5 className="font-black mb-1.5 text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-[10px] tracking-widest">{svc.title}</h5>
                            <p className="text-slate-500 text-sm mb-4 font-bold leading-relaxed">{svc.desc}</p>
                            <a href={svc.link} target="_blank" rel="noopener noreferrer" className="text-xs font-black text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-2 transition-all">View Repository</a>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Contact Modal */}
            <Modal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} title="Get in Touch" icon={Mail} colorClass="text-pink-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Presence */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Digital Presence</p>
                            <div className="space-y-4">
                                <a href="https://thirumalx.github.io" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all group">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center border border-slate-100">
                                        <Globe className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Portfolio</p>
                                        <p className="font-extrabold text-sm text-slate-900">thirumalx.github.io</p>
                                    </div>
                                </a>

                                <div className="grid grid-cols-2 gap-4">
                                    <a href="https://github.com/thirumalx" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-3.5 p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group">
                                        <Github className="w-5 h-5 text-slate-800 group-hover:text-white transition-all" />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-400 transition-colors">GitHub</p>
                                            <p className="font-black text-xs mt-0.5">@thirumalx</p>
                                        </div>
                                    </a>
                                    <a href="https://www.linkedin.com/in/thirumalm/" target="_blank" rel="noopener noreferrer" className="flex flex-col gap-3.5 p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all group">
                                        <Linkedin className="w-5 h-5 text-[#0A66C2] group-hover:text-white transition-all" />
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-100 transition-colors">LinkedIn</p>
                                            <p className="font-black text-xs mt-0.5">thirumalm</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Communication */}
                    <div className="space-y-6 flex flex-col justify-between">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Direct Communication</p>
                            <div className="space-y-4">
                                <a href="mailto:racetortoise@gmail.com" className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-pink-100 hover:bg-pink-50/20 transition-all group border-l-4 border-l-pink-500">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center border border-slate-100">
                                        <Mail className="w-5 h-5 text-pink-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Email Address</p>
                                        <p className="font-extrabold text-sm text-slate-900">racetortoise@gmail.com</p>
                                    </div>
                                </a>

                                <a href="tel:+918973697871" className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all group border-l-4 border-l-indigo-500">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center border border-slate-100">
                                        <Phone className="w-5 h-5 text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Phone Number</p>
                                        <p className="font-extrabold text-sm text-slate-900">+91 89736 97871</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400">Developed by <span className="text-indigo-600 font-extrabold">Thirumal M</span></p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
