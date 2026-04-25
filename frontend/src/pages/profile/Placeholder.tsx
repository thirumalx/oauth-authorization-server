import { LucideIcon, Construction } from 'lucide-react';

interface PlaceholderProps {
    title: string;
    icon: LucideIcon;
    description?: string;
}

export default function Placeholder({ title, icon: Icon, description }: PlaceholderProps) {
    return (
        <div className="space-y-4 animate-fade-in">
            {/* Compact header card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                        <Icon className="w-4 h-4" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black text-slate-900 tracking-tight">{title}</h1>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 leading-snug">
                            {description || `Manage your ${title.toLowerCase()} settings`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Under construction body */}
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center shadow-sm animate-fade-in flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl shadow-inner">
                        <Icon className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 animate-bounce">
                        <Construction className="w-4 h-4 text-amber-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
                    <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto leading-relaxed">
                        {description || `This feature is under active development. You'll soon be able to manage your ${title.toLowerCase()} directly from this portal.`}
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                    Engineering in Progress
                </div>
            </div>
        </div>
    );
}
