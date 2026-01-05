import { Shirt, Puzzle, BookOpen, Baby, Wrench, Palette, Heart, Package } from 'lucide-react';

export const PRODUCT_CATEGORIES = [
  { value: 'roupas', label: 'Roupas', icon: Shirt, color: 'bg-pink-500' },
  { value: 'brinquedos', label: 'Brinquedos', icon: Puzzle, color: 'bg-purple-500' },
  { value: 'materiais', label: 'Materiais', icon: BookOpen, color: 'bg-blue-500' },
  { value: 'terapia', label: 'Terapia', icon: Heart, color: 'bg-red-500' },
  { value: 'bebe', label: 'Bebê', icon: Baby, color: 'bg-cyan-500' },
  { value: 'ferramentas', label: 'Ferramentas', icon: Wrench, color: 'bg-amber-500' },
  { value: 'artesanato', label: 'Artesanato', icon: Palette, color: 'bg-emerald-500' },
  { value: 'outros', label: 'Outros', icon: Package, color: 'bg-slate-500' },
];

interface CategoryFilterProps {
  selected: string | null;
  onChange: (category: string | null) => void;
}

const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      <button
        onClick={() => onChange(null)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
          selected === null
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-muted/60 text-muted-foreground hover:bg-muted'
        }`}
      >
        <Package size={14} />
        Todos
      </button>
      
      {PRODUCT_CATEGORIES.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.value;
        
        return (
          <button
            key={category.value}
            onClick={() => onChange(isSelected ? null : category.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
              isSelected
                ? `${category.color} text-white shadow-md`
                : 'bg-muted/60 text-muted-foreground hover:bg-muted'
            }`}
          >
            <Icon size={14} />
            {category.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
