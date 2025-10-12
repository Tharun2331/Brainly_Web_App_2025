// src/components/ui/ChatInterface.tsx
import { useState, useRef, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { 
  addUserMessage, 
  startStreaming, 
  appendStreamToken, 
  finishStreaming,
  setError,
  clearChat,
  closeChat
} from '../../store/slices/chatSlice';
import { 
  Send, 
  Loader2, 
  X, 
  ExternalLink, 
  Sparkles,
  Trash2,
  MessageSquare
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export function ChatInterface() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector(state => state.auth);
  const { 
    messages, 
    isStreaming, 
    currentStreamContent,
    currentSources,
    error,
    isOpen 
  } = useAppSelector(state => state.chat);
  
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamContent]);

  // Load suggestions on mount
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/chat/suggestions`, {
        headers: { Authorization: token! }
      });
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  };

  const handleSend = async (messageText?: string) => {
    const userMessage = (messageText || input).trim();
    
    if (!userMessage || isStreaming) return;

    setInput('');
    dispatch(addUserMessage(userMessage));

    abortControllerRef.current = new AbortController();

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${BACKEND_URL}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token!
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let sources: any[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'sources') {
                sources = data.sources;
                dispatch(startStreaming(sources));
              } else if (data.type === 'token') {
                dispatch(appendStreamToken(data.content));
              } else if (data.type === 'done') {
                dispatch(finishStreaming());
              } else if (data.type === 'error') {
                dispatch(setError(data.message));
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError);
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Chat error:', error);
        dispatch(setError(error.message || 'Failed to send message'));
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear all chat history?')) {
      dispatch(clearChat());
      loadSuggestions();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-auto md:right-4 md:bottom-4 md:w-[500px] md:h-[700px] 
                    bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Chat with Your Content</h3>
            <p className="text-xs text-muted-foreground">AI-powered assistant</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button
            onClick={() => dispatch(closeChat())}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Welcome Message */}
        {messages.length === 0 && !isStreaming && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Ask me anything!
            </h4>
            <p className="text-sm text-muted-foreground mb-6">
              I can answer questions about your saved content
            </p>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground mb-3">Try asking:</p>
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full p-3 bg-muted hover:bg-muted/80 rounded-lg text-left text-sm text-foreground transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages List */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
              
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Sources ({message.sources.length})
                  </p>
                  <div className="space-y-2">
                    {message.sources.map((source) => (
                      <div
                        key={source.id}
                        className="text-xs p-2 bg-background/50 rounded border border-border/50"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-medium flex-1 line-clamp-1">
                            {source.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                            {Math.round(source.score * 100)}%
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-1">
                          {source.excerpt}
                        </p>
                        {source.link && (
                          <a
                            href={source.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-primary hover:underline inline-flex items-center gap-1"
                          >
                            View content <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

))}

{/* Streaming message */}
{isStreaming && (
  <div className="flex justify-start">
    <div className="max-w-[85%] rounded-lg p-4 bg-muted text-foreground">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <ReactMarkdown>{currentStreamContent}</ReactMarkdown>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Loader2 className="w-3 h-3 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground">Thinking...</span>
      </div>

      {/* Show sources while streaming */}
      {currentSources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
            <ExternalLink className="w-3 h-3" />
            Using {currentSources.length} sources
          </p>
          <div className="flex flex-wrap gap-1">
            {currentSources.map((source) => (
              <span
                key={source.id}
                className="text-[10px] px-2 py-1 bg-primary/10 text-primary rounded-full"
              >
                {source.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
)}

{/* Error Message */}
{error && (
  <div className="flex justify-center">
    <div className="max-w-[85%] rounded-lg p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <p className="text-sm text-red-700 dark:text-red-400">
        <strong>Error:</strong> {error}
      </p>
    </div>
  </div>
)}

<div ref={messagesEndRef} />
</div>

{/* Input */}
<div className="p-4 border-t border-border bg-background">
<div className="flex gap-2">
  <input
    ref={inputRef}
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    onKeyPress={handleKeyPress}
    placeholder="Ask about your content..."
    disabled={isStreaming}
    className="flex-1 px-4 py-3 bg-muted border border-border rounded-lg 
             focus:outline-none focus:ring-2 focus:ring-primary 
             disabled:opacity-50 disabled:cursor-not-allowed
             text-foreground placeholder:text-muted-foreground"
  />
  <button
    onClick={() => handleSend()}
    disabled={!input.trim() || isStreaming}
    className="px-4 py-3 bg-primary text-primary-foreground rounded-lg 
             hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
             transition-colors flex items-center gap-2 font-medium"
  >
    {isStreaming ? (
      <>
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="hidden sm:inline">Sending</span>
      </>
    ) : (
      <>
        <Send className="w-5 h-5" />
        <span className="hidden sm:inline">Send</span>
      </>
    )}
  </button>
</div>

{/* Helper text */}
<p className="text-xs text-muted-foreground mt-2 text-center">
  Press Enter to send • Shift+Enter for new line
</p>
</div>
</div>
);
}