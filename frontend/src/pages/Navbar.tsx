import React, { useState } from 'react';
import { Shield, Home, User as UserIcon, Code, Mail, LogOut, X, Github, Linkedin, Globe } from 'lucide-react';

export default function Navbar() {
    const [isAboutOpen, setIsAboutOpen] = useState(false);
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
                    <a href="/user" className="flex items-center gap-3 group">
                        <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-200 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-extrabold tracking-tight text-slate-900">Auth Server</span>
                    </a>

                    <div className="hidden md:flex items-center gap-1">
                        <a href="/user" className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm">
                            <Home className="w-4 h-4" />
                            Home
                        </a>
                        <button onClick={() => setIsAboutOpen(true)} className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all font-bold text-sm">
                            <UserIcon className="w-4 h-4" />
                            About
                        </button>
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
                            <a href="/profile" title="Profile" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                <UserIcon className="w-5 h-5" />
                            </a>
                            <a href="/logout" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 rounded-xl transition-all shadow-sm">
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-bold">Logout</span>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* About Modal */}
            <Modal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} title="About Thirumal" icon={UserIcon} colorClass="text-indigo-600">
                <div className="flex flex-col md:flex-row gap-8">
                    <img src="https://avatars.githubusercontent.com/u/12644168?v=4" className="w-32 h-32 rounded-3xl border-2 border-indigo-500/20" alt="Thirumal" />
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-2xl font-bold">Thirumal</h4>
                            <p className="text-slate-400 font-medium italic">Full Stack Developer | OAuth2 Specialist</p>
                        </div>
                        <div className="space-y-2 text-slate-300">
                            <p>Building secure, scalable authorization systems using Spring Boot and modern architectures.</p>
                            <p className="flex items-center gap-2"><Shield className="w-4 h-4 text-indigo-400" /> Specialist in Spring Security & OAuth2.1</p>
                        </div>
                    </div>
                </div>
            </Modal>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <a href="https://github.com/thirumalx" target="_blank" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                        <Github className="w-6 h-6 text-slate-800" />
                        <div><p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">GitHub</p><p className="font-bold text-slate-900">@thirumalx</p></div>
                    </a>
                    <a href="https://www.linkedin.com/in/thirumalm/" target="_blank" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                        <Linkedin className="w-6 h-6 text-[#0A66C2]" />
                        <div><p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">LinkedIn</p><p className="font-bold text-slate-900">thirumalm</p></div>
                    </a>
                    <a href="https://thirumalx.github.io" target="_blank" className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all col-span-full">
                        <Globe className="w-6 h-6 text-emerald-600" />
                        <div><p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Portfolio</p><p className="font-bold text-slate-900">thirumalx.github.io</p></div>
                    </a>
                </div>
            </Modal>
        </>
    );
}
