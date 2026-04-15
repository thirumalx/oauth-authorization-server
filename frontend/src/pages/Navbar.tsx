import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Home, User as UserIcon, Code, Mail, LogOut, X, Github, Linkedin, Globe, Phone } from 'lucide-react';

export default function Navbar() {
    const [isServicesOpen, setIsServicesOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);

    const Modal = ({ isOpen, onClose, title, icon: Icon, children, colorClass }: any) => {
        if (!isOpen) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl relative animate-fade-in">
                    <div className={`flex items-center justify-between p-6 border-b border-slate-100 ${colorClass}`}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                <Icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-8">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/user" className="flex items-center gap-3.5 group">
                        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 group-hover:rotate-[15deg] group-hover:bg-indigo-500 transition-all duration-300">
                            <Shield className="w-6 h-6 text-white group-hover:pulse-subtle" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">Auth Server</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1">
                        <Link to="/user" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm">
                            <Home className="w-4 h-4" />
                            Home
                        </Link>
                        <button onClick={() => setIsServicesOpen(true)} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm">
                            <Code className="w-4 h-4" />
                            Services
                        </button>
                        <button onClick={() => setIsContactOpen(true)} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm">
                            <Mail className="w-4 h-4" />
                            Contact
                        </button>

                        <div className="w-px h-6 bg-slate-200 mx-2" />

                        <div className="flex items-center gap-2">
                            <Link to="/profile/personal-info" title="Profile" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                <UserIcon className="w-5 h-5" />
                            </Link>
                            <a href="/logout" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 rounded-xl transition-all shadow-sm group">
                                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                <span className="text-sm font-bold">Logout</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Services Modal */}
            <Modal isOpen={isServicesOpen} onClose={() => setIsServicesOpen(false)} title="Projects & Services" icon={Code} colorClass="text-emerald-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: 'OAuth Server', desc: 'Modern OAuth2.1 Authorization Server', link: 'https://github.com/thirumalx/oauth-authorization-server' },
                        { title: 'Resource Server', desc: 'Secure API Resource Server implementation', link: 'https://github.com/thirumalx' }
                    ].map((svc, i) => (
                        <div key={i} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-indigo-50/50 hover:border-indigo-200 transition-all group">
                            <h5 className="font-extrabold mb-1 text-slate-900 group-hover:text-indigo-600 transition-colors uppercase text-xs tracking-widest">{svc.title}</h5>
                            <p className="text-slate-600 text-sm mb-3 font-medium">{svc.desc}</p>
                            <a href={svc.link} target="_blank" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline transition-all">View Project</a>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Contact Modal */}
            <Modal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} title="Get in Touch" icon={Mail} colorClass="text-pink-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Presence */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Digital Presence</p>
                            <div className="space-y-4">
                                <a href="https://thirumalx.github.io" target="_blank" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-md transition-all group">
                                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                        <Globe className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-1">Portfolio</p>
                                        <p className="font-bold text-slate-900">thirumalx.github.io</p>
                                    </div>
                                </a>

                                <div className="grid grid-cols-2 gap-4">
                                    <a href="https://github.com/thirumalx" target="_blank" className="flex flex-col gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition-all group">
                                        <Github className="w-6 h-6 text-slate-800 group-hover:text-white group-hover:rotate-12 transition-all" />
                                        <div>
                                            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">GitHub</p>
                                            <p className="font-bold text-sm">@thirumalx</p>
                                        </div>
                                    </a>
                                    <a href="https://www.linkedin.com/in/thirumalm/" target="_blank" className="flex flex-col gap-3 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all group">
                                        <Linkedin className="w-6 h-6 text-[#0A66C2] group-hover:text-white group-hover:scale-110 transition-all" />
                                        <div>
                                            <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-blue-100 transition-colors">LinkedIn</p>
                                            <p className="font-bold text-sm">thirumalm</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Communication */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Direct Communication</p>
                            <div className="space-y-4">
                                <a href="mailto:[racetortoise@gmail.com]" target="_blank" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-pink-400 hover:bg-pink-50/50 hover:shadow-md transition-all group border-l-4 border-l-pink-500">
                                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                        <Mail className="w-6 h-6 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-1">Email Address</p>
                                        <p className="font-bold text-slate-900">racetortoise@gmail.com</p>
                                    </div>
                                </a>

                                <a href="tel:+918973697871" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md transition-all group border-l-4 border-l-indigo-500">
                                    <div className="p-3 bg-white rounded-xl shadow-sm group-hover:shake transition-transform">
                                        <Phone className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                                        <p className="font-bold text-slate-900">+91-8973697871</p>
                                    </div>
                                </a>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 italic">Developed by <span className="text-indigo-600 not-italic">Thirumal M</span></p>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
}

