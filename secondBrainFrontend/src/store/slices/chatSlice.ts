// src/store/slices/chatSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Source {
  id: string;
  title: string;
  type: string;
  link?: string;
  score: number;
  excerpt: string;
  metadata?: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: string;
}

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  currentStreamContent: string;
  currentSources: Source[];
  error: string | null;
  isOpen: boolean;
}

const initialState: ChatState = {
  messages: [],
  isStreaming: false,
  currentStreamContent: '',
  currentSources: [],
  error: null,
  isOpen: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      if (!state.isOpen) {
        // Clear streaming state when closing
        state.currentStreamContent = '';
        state.isStreaming = false;
      }
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
      state.currentStreamContent = '';
      state.isStreaming = false;
    },
    addUserMessage: (state, action: PayloadAction<string>) => {
      state.messages.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString()
      });
      state.error = null;
    },
    startStreaming: (state, action: PayloadAction<Source[]>) => {
      state.isStreaming = true;
      state.currentStreamContent = '';
      state.currentSources = action.payload;
      state.error = null;
    },
    appendStreamToken: (state, action: PayloadAction<string>) => {
      state.currentStreamContent += action.payload;
    },
    finishStreaming: (state) => {
      if (state.currentStreamContent) {
        state.messages.push({
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: state.currentStreamContent,
          sources: state.currentSources,
          timestamp: new Date().toISOString()
        });
      }
      state.isStreaming = false;
      state.currentStreamContent = '';
      state.currentSources = [];
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isStreaming = false;
      state.currentStreamContent = '';
    },
    clearChat: (state) => {
      state.messages = [];
      state.currentStreamContent = '';
      state.currentSources = [];
      state.error = null;
      state.isStreaming = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  }
});

export const {
  toggleChat,
  openChat,
  closeChat,
  addUserMessage,
  startStreaming,
  appendStreamToken,
  finishStreaming,
  setError,
  clearChat,
  clearError
} = chatSlice.actions;

export default chatSlice.reducer;