// src/components/ui/ChatButton.tsx
import { MessageCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { toggleChat } from '../../store/slices/chatSlice';

export function ChatButton() {
  const dispatch = useAppDispatch();
  const { isOpen, messages } = useAppSelector(state => state.chat);
  const unreadCount = 0; // Could track unread messages if needed

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => dispatch(toggleChat())}
          className="fixed bottom-6 right-6 z-40 p-4 bg-primary text-primary-foreground 
                     rounded-full shadow-lg hover:shadow-xl hover:scale-110 
                     transition-all duration-200 group"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Unread badge */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white 
                           text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}

          {/* Pulse animation for first-time users */}
          {messages.length === 0 && (
            <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75" />
          )}

          {/* Tooltip */}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white 
                         text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 
                         transition-opacity pointer-events-none">
            Chat with your content
          </span>
        </button>
      )}
    </>
  );
}