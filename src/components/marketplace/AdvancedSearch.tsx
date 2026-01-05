import { useState, useEffect, useRef } from 'react';
import { Search, Clock, X, TrendingUp, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SearchHistoryItem {
  id: string;
  query: string;
  created_at: string;
}

interface AdvancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions?: string[];
  placeholder?: string;
}

const AdvancedSearch = ({ value, onChange, onSearch, suggestions = [], placeholder }: AdvancedSearchProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const defaultSuggestions = [
    'Materiais adaptados',
    'Jogos educativos',
    'Roupas sensoriais',
    'Kit terapia',
    'Brinquedos inclusivos'
  ];

  const allSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      if (user?.id) {
        fetchSearchHistory(user.id);
      }
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSearchHistory = async (uid: string) => {
    const { data } = await supabase
      .from('search_history')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) {
      // Remove duplicates
      const unique = data.filter((item, index, self) =>
        index === self.findIndex((t) => t.query.toLowerCase() === item.query.toLowerCase())
      ).slice(0, 5);
      setSearchHistory(unique);
    }
  };

  const saveSearchToHistory = async (query: string) => {
    if (!userId || !query.trim()) return;

    // Check if query already exists
    const exists = searchHistory.some(
      item => item.query.toLowerCase() === query.toLowerCase()
    );

    if (!exists) {
      await supabase
        .from('search_history')
        .insert({ user_id: userId, query: query.trim() });
      
      fetchSearchHistory(userId);
    }
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    await supabase
      .from('search_history')
      .delete()
      .eq('id', id);
    
    setSearchHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearAllHistory = async () => {
    if (!userId) return;
    
    await supabase
      .from('search_history')
      .delete()
      .eq('user_id', userId);
    
    setSearchHistory([]);
  };

  const handleSubmit = (query: string) => {
    onSearch(query);
    saveSearchToHistory(query);
    setShowDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      handleSubmit(value);
    }
  };

  const filteredSuggestions = allSuggestions.filter(
    s => s.toLowerCase().includes(value.toLowerCase()) && value.length > 0
  );

  const showHistory = searchHistory.length > 0 && value.length === 0;
  const showSuggestions = filteredSuggestions.length > 0 && value.length > 0;
  const showDefaultSuggestions = value.length === 0 && searchHistory.length === 0;

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <Search className="text-muted-foreground" size={18} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder || "Buscar produtos, categorias..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-12 pr-12 py-3.5 bg-card/80 border border-border/50 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-success/30 focus:border-success/50 shadow-sm transition-all placeholder:text-muted-foreground/70"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (showHistory || showSuggestions || showDefaultSuggestions) && (
        <div 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-2xl shadow-xl overflow-hidden z-20 animate-fade-in"
        >
          {/* Search History */}
          {showHistory && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock size={12} />
                  Buscas recentes
                </span>
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-destructive hover:underline"
                >
                  Limpar
                </button>
              </div>
              <div className="space-y-1">
                {searchHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onChange(item.query);
                      handleSubmit(item.query);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-muted transition-colors group"
                  >
                    <span className="flex items-center gap-2 text-sm text-foreground">
                      <Clock size={14} className="text-muted-foreground" />
                      {item.query}
                    </span>
                    <button
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded-full transition-all"
                    >
                      <X size={14} className="text-destructive" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions when typing */}
          {showSuggestions && (
            <div className="p-2">
              <span className="text-xs font-semibold text-muted-foreground px-3 py-1 block flex items-center gap-1">
                <Sparkles size={12} />
                Sugestões
              </span>
              <div className="space-y-1">
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onChange(suggestion);
                      handleSubmit(suggestion);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <Search size={14} className="text-muted-foreground" />
                    <span className="text-sm text-foreground">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Default suggestions when empty */}
          {showDefaultSuggestions && (
            <div className="p-2">
              <span className="text-xs font-semibold text-muted-foreground px-3 py-1 block flex items-center gap-1">
                <TrendingUp size={12} />
                Mais buscados
              </span>
              <div className="space-y-1">
                {allSuggestions.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onChange(suggestion);
                      handleSubmit(suggestion);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors text-left"
                  >
                    <TrendingUp size={14} className="text-success" />
                    <span className="text-sm text-foreground">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
