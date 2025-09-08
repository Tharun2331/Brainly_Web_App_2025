import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type UIState } from '../types/index';

const initialState: UIState = {
  modals: {
    createContent: false,
    share: false,
  },
  shareLink: null,
  selectedNote: null,
};

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
  },
});

export const { 
  toggleCreateContentModal, 
  toggleShareModal, 
  setShareLink, 
  setSelectedNote, 
  closeAllModals 
} = uiSlice.actions;
export default uiSlice.reducer;