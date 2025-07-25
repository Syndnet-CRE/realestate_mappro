import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const SearchBar = ({ onSearch, onSuggestionSelect, searchValue, setSearchValue }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const searchRef = useRef(null);

  const mockSuggestions = [
    { id: 1, text: "Single family homes in Austin TX", type: "location", icon: "MapPin" },
    { id: 2, text: "Multi-family properties under $500K", type: "criteria", icon: "Building" },
    { id: 3, text: "Commercial properties near downtown", type: "location", icon: "Building2" },
    { id: 4, text: "Distressed properties for renovation", type: "criteria", icon: "Wrench" },
    { id: 5, text: "Properties with high cap rates", type: "criteria", icon: "TrendingUp" },
    { id: 6, text: "Waterfront properties in Florida", type: "location", icon: "Waves" },
    { id: 7, text: "Industrial properties near highways", type: "location", icon: "Truck" },
    { id: 8, text: "Properties with development potential", type: "criteria", icon: "Zap" }
  ];

  useEffect(() => {
    if (searchValue.length > 2) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.text.toLowerCase().includes(searchValue.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchValue]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestion(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestion >= 0) {
        handleSuggestionClick(suggestions[activeSuggestion]);
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchValue(suggestion.text);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    onSuggestionSelect(suggestion);
  };

  const handleSearch = () => {
    if (searchValue.trim()) {
      onSearch(searchValue);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setSearchValue('');
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    searchRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Icon name="Search" size={20} className="text-text-secondary" />
        </div>
        
        <Input
          ref={searchRef}
          type="text"
          placeholder="Search properties by location, type, price range, or investment criteria..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-12 pr-24 h-14 text-lg bg-surface border-2 border-border focus:border-primary rounded-xl shadow-elevation-1"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          {searchValue && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-8 w-8 hover:bg-muted"
            >
              <Icon name="X" size={16} />
            </Button>
          )}
          
          <Button
            variant="default"
            onClick={handleSearch}
            className="h-10 px-6 bg-primary hover:bg-primary/90"
          >
            <Icon name="Search" size={16} className="mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-elevation-3 z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-text-secondary px-3 py-2 border-b border-border">
              Search Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion.id}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full flex items-center space-x-3 px-3 py-3 text-left rounded-md transition-colors duration-150 ${
                  index === activeSuggestion
                    ? 'bg-primary/10 text-primary' :'hover:bg-muted text-text-primary'
                }`}
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  suggestion.type === 'location' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  <Icon name={suggestion.icon} size={16} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{suggestion.text}</div>
                  <div className="text-xs text-text-secondary capitalize">{suggestion.type} search</div>
                </div>
                <Icon name="ArrowUpRight" size={14} className="text-text-secondary" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;