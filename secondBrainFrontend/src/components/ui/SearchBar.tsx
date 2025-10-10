// src/components/ui/SearchBar.tsx
import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { performSemanticSearch, clearSearch, fetchSearchSuggestions, clearSuggestions } from "../../store/slices/searchSlice";
import { Search, X, Loader2, Sparkles, ExternalLink } from "lucide-react";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SearchBar({ 
  isMobile = false, 
  onClose,
  className = "" 
}: SearchBarProps) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);
  const { query, results, loading, totalResults, suggestions } = useAppSelector(state => state.search);
  
  const [inputValue, setInputValue] = useState(query);
  const [showResults, setShowResults] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mobile when opened
  useEffect(() => {
    if (isMobile && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMobile]);

  // Debounce search
  useEffect(() => {
    if (!inputValue.trim() || !token) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      dispatch(performSemanticSearch({ query: inputValue, token }));
      setShowResults(true);
      setShowSuggestions(false);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [inputValue, token, dispatch]);

  // Fetch suggestions when typing
  useEffect(() => {
    if (inputValue.length >= 2 && token) {
      const suggestionTimer = setTimeout(() => {
        dispatch(fetchSearchSuggestions({ prefix: inputValue, token }));
        setShowSuggestions(true);
      }, 300);

      return () => clearTimeout(suggestionTimer);
    } else {
      dispatch(clearSuggestions());
      setShowSuggestions(false);
    }
  }, [inputValue, token, dispatch]);

  // Close results when clicking outside (desktop only)
  useEffect(() => {
    if (isMobile) return; // Don't auto-close on mobile

    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  const handleClear = () => {
    setInputValue('');
    dispatch(clearSearch());
    setShowResults(false);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    if (!value.trim()) {
      dispatch(clearSearch());
      setShowResults(false);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    if (token) {
      dispatch(performSemanticSearch({ query: suggestion, token }));
      setShowResults(true);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      youtube: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      twitter: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      article: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
      note: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600 bg-gray-50';
  };

  const handleResultClick = () => {
    setShowResults(false);
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Mobile full-screen layout
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Mobile Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Close search"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>

            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Search with AI..."
                className="w-full pl-10 pr-10 py-3 bg-muted border border-border rounded-lg 
                          focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                          text-foreground placeholder:text-muted-foreground text-base"
              />
              
              {(loading || inputValue) && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                  ) : inputValue ? (
                    <button
                      onClick={handleClear}
                      className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* AI Badge - Mobile */}
          {inputValue && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 ml-12">
              <Sparkles className="w-3 h-3" />
              <span>AI-powered semantic search</span>
            </div>
          )}
        </div>

        {/* Mobile Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Suggestions - Mobile */}
          {showSuggestions && suggestions.length > 0 && !showResults && (
            <div className="p-4">
              <p className="text-xs text-muted-foreground px-2 py-1 mb-2">Suggestions</p>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-muted active:bg-muted/80 rounded-lg transition-colors text-base text-foreground flex items-center gap-3"
                  >
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{suggestion}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Results - Mobile */}
          {showResults && results.length > 0 && (
            <div>
              <div className="p-4 border-b border-border sticky top-0 bg-background/95 backdrop-blur-sm">
                <p className="text-sm text-muted-foreground">
                  Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
                </p>
              </div>
              
              <div className="divide-y divide-border">
                {results.map((result) => (
                  <div
                    key={result._id}
                    className="p-4 active:bg-muted cursor-pointer transition-colors"
                    onClick={handleResultClick}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeColor(result.type)}`}>
                            {result.type}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(result.relevanceScore * 100)}% match
                          </span>
                        </div>
                        
                        {result.link && (
                          <a
                            href={result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0 p-2 text-primary hover:text-primary/80 active:scale-95 transition-transform"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                      
                      <h4 className="font-medium text-foreground text-base leading-snug">
                        {result.title || 'Untitled'}
                      </h4>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {result.description}
                      </p>
                      
                      {result.tags && result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {result.tags.slice(0, 3).map((tag) => {
                            const tagText = typeof tag === 'string' ? tag : tag.tag;
                            const tagId = typeof tag === 'string' ? tag : tag._id;
                            
                            return (
                              <span
                                key={tagId}
                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                              >
                                #{tagText}
                              </span>
                            );
                          })}
                          {result.tags.length > 3 && (
                            <span className="text-xs text-muted-foreground py-1">
                              +{result.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Results - Mobile */}
          {showResults && !loading && inputValue && results.length === 0 && (
            <div className="p-8 text-center">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-medium text-foreground text-lg mb-2">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try different keywords or add more content
              </p>
            </div>
          )}

          {/* Empty State - Mobile */}
          {!inputValue && (
            <div className="p-8 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-medium text-foreground text-lg mb-2">AI-Powered Search</p>
              <p className="text-sm text-muted-foreground">
                Start typing to search your content intelligently
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop inline layout
  return (
    <div ref={searchRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0) setShowResults(true);
            if (suggestions.length > 0 && inputValue.length >= 2) setShowSuggestions(true);
          }}
          placeholder="Search with AI..."
          className="w-full pl-10 pr-10 py-2.5 bg-muted border border-border rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                     text-foreground placeholder:text-muted-foreground
                     transition-all duration-200"
        />
        
        {(loading || inputValue) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {loading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : inputValue ? (
              <button
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* AI Search Badge - Desktop */}
      {inputValue && (
        <div className="absolute top-full left-0 mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>AI-powered semantic search</span>
        </div>
      )}

      {/* Suggestions Dropdown - Desktop */}
      {showSuggestions && suggestions.length > 0 && !showResults && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl">
          <div className="p-2">
            <p className="text-xs text-muted-foreground px-2 py-1">Suggestions</p>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm text-foreground"
              >
                <Search className="w-4 h-4 inline mr-2 text-muted-foreground" />
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Dropdown - Desktop */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-border sticky top-0 bg-card">
            <p className="text-sm text-muted-foreground">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>
          </div>
          
          <div className="divide-y divide-border">
            {results.map((result) => (
              <div
                key={result._id}
                className="p-4 hover:bg-muted cursor-pointer transition-colors"
                onClick={handleResultClick}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getTypeColor(result.type)}`}>
                        {result.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.relevanceScore * 100)}% match
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-foreground truncate mb-1">
                      {result.title || 'Untitled'}
                    </h4>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {result.description}
                    </p>
                    
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.tags.slice(0, 3).map((tag) => {
                          const tagText = typeof tag === 'string' ? tag : tag.tag;
                          const tagId = typeof tag === 'string' ? tag : tag._id;
                          
                          return (
                            <span
                              key={tagId}
                              className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full"
                            >
                              #{tagText}
                            </span>
                          );
                        })}
                        {result.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{result.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {result.link && (
                    <a
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-shrink-0 text-primary hover:text-primary/80"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results - Desktop */}
      {showResults && !loading && inputValue && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-lg shadow-xl p-8 text-center">
          <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="font-medium text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground mt-1">Try different keywords or add more content</p>
        </div>
      )}
    </div>
  );
}