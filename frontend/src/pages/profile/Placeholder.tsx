import { LucideIcon, Construction } from 'lucide-react';

interface PlaceholderProps {
    title: string;
    icon: LucideIcon;
    description?: string;
}

export default function Placeholder({ title, icon: Icon, description }: PlaceholderProps) {
    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-16 text-center shadow-2xl shadow-slate-200/40 animate-fade-in flex flex-col items-center gap-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
                <Icon className="w-96 h-96" />
            </div>
            
            <div className="relative">
                <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] shadow-inner">
                    <Icon className="w-16 h-16 text-indigo-600" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 animate-bounce">
                    <Construction className="w-6 h-6 text-amber-500" />
                </div>
            </div>

            <div className="space-y-3 relative">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
                <p className="text-slate-500 font-bold max-w-md mx-auto leading-relaxed">
                    {description || `This feature is currently under active development. You'll soon be able to manage your ${title.toLowerCase()} directly from this portal.`}
                </p>
            </div>

            <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] relative">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping" />
                Engineering in Progress
            </div>
        </div>
    );
}
