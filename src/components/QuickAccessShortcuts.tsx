import { BookOpen, Camera, Award, Calendar, HeartHandshake } from 'lucide-react';

interface QuickAccessShortcutsProps {
  onNavigate: (tab: string) => void;
}

const shortcuts = [
  { id: 'support', icon: HeartHandshake, label: 'Apoio', tab: 'profile', section: 'apoio', color: 'bg-pink-500/20 text-pink-600 dark:text-pink-400' },
  { id: 'resources', icon: BookOpen, label: 'Recursos', tab: 'profile', section: 'recursos', color: 'bg-accent/20 text-accent-foreground' },
  { id: 'gallery', icon: Camera, label: 'Galeria', tab: 'profile', section: 'galeria', color: 'bg-secondary/80 text-secondary-foreground' },
  { id: 'store', icon: Award, label: 'Loja', tab: 'profile', section: 'loja', color: 'bg-primary/20 text-primary' },
  { id: 'calendar', icon: Calendar, label: 'Agenda', tab: 'calendar', color: 'bg-muted text-muted-foreground' },
];

const QuickAccessShortcuts = ({ onNavigate }: QuickAccessShortcutsProps) => {
  const handleClick = (shortcut: typeof shortcuts[0]) => {
    if (shortcut.section) {
      // Store the section to navigate to after switching tabs
      localStorage.setItem('profile_section', shortcut.section);
    }
    onNavigate(shortcut.tab);
  };

  return (
    <div className="px-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-3">Acesso Rápido</h3>
      <div className="grid grid-cols-5 gap-2">
        {shortcuts.map((shortcut) => {
          const Icon = shortcut.icon;
          return (
            <button
              key={shortcut.id}
              onClick={() => handleClick(shortcut)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all active:scale-95 ${shortcut.color}`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium">{shortcut.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickAccessShortcuts;