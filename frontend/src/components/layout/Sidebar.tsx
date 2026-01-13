import { Brain, MessageSquare, Upload, Settings } from 'lucide-react';

interface SidebarProps {
    activeView: 'chat' | 'ingest';
    onViewChange: (view: 'chat' | 'ingest') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
    const navItems = [
        { id: 'chat' as const, icon: MessageSquare, label: 'Chat' },
        { id: 'ingest' as const, icon: Upload, label: 'Ingest' },
    ];

    return (
        <aside className="w-72 h-full bg-bg-secondary border-r border-border flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center glow-accent">
                        <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-text-primary">OmniScribe</h1>
                        <p className="text-xs text-text-muted">AI Knowledge Assistant</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;

                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onViewChange(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                            ? 'bg-accent/20 text-accent-glow border border-accent/30'
                                            : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-tertiary">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-success to-emerald-600 flex items-center justify-center">
                        <Settings className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">Backend Status</p>
                        <p className="text-xs text-success">Connected • localhost:8000</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
