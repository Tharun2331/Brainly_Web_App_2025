import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type UIState } from '../types/index';
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || "http://localhost:5173";


const getInitialDarkMode = (): boolean => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};


const initialState: UIState = {
  modals: {
    createContent: false,
    share: false,
  },
  shareLink: null,
  selectedNote: null,
  shareLoading: false,
  shareError:null,
  isDarkMode: getInitialDarkMode(),
  isSidebarOpen:false,
};




export const generateShareLink = createAsyncThunk(
  'ui/generateShareLink',
  async (token: string) => {
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/brain/share`,
      {share: true},
      {headers: {Authorization: token}}
    );
    const hash = response.data.data.hash || "";

    const baseUrl = FRONTEND_URL.endsWith("/") ? FRONTEND_URL.slice(0,-1) : FRONTEND_URL;
    const shareLink = `${baseUrl}/share/${hash}`;
    
    return shareLink;
  }
)

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleCreateContentModal: (state) => {
      state.modals.createContent = !state.modals.createContent;
      if (!state.modals.createContent) {
        state.selectedNote = null;
      }
    },
    toggleShareModal: (state) => {
      state.modals.share = !state.modals.share;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;

      if(typeof window !== 'undefined') {
        localStorage.setItem('darkMode', JSON.stringify(state.isDarkMode));
        // Apply dark class to document
        if (state.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      },
      setDarkMode: (state, action: PayloadAction<boolean>) => {
        state.isDarkMode = action.payload;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('darkMode', JSON.stringify(state.isDarkMode));
        // Apply dark class to document
        if (state.isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    },

    setShareLink: (state, action: PayloadAction<string>) => {
      state.shareLink = action.payload;
    },
    setSelectedNote: (state, action: PayloadAction<UIState['selectedNote']>) => {
      state.selectedNote = action.payload;
      if (action.payload) {
        state.modals.createContent = true;
      }
    },
    closeAllModals: (state) => {
      state.modals.createContent = false;
      state.modals.share = false;
      state.selectedNote = null;
    },
    clearShareLink: (state) => {
      state.shareLink = null;
      state.shareError = null;
    }
  },
  extraReducers: (builder) => {
    builder
    .addCase(generateShareLink.pending, (state) => {
      state.shareLoading=true;
      state.shareError=null;
    })
    .addCase(generateShareLink.fulfilled, (state,action) => {
      state.shareLoading = false;
      state.shareLink = action.payload;
    })
    .addCase(generateShareLink.rejected, (state, action)=> {
      state.shareLoading=false;
      state.shareError = action.error.message || "Failed to generate share link";
    })
  }
});

export const { 
  toggleCreateContentModal, 
  toggleShareModal, 
  setShareLink, 
  setSelectedNote, 
  closeAllModals,
  clearShareLink,
  toggleDarkMode,
  setDarkMode,
  toggleSidebar,
  closeSidebar
} = uiSlice.actions;
export default uiSlice.reducer;