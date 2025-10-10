import { createSlice, createAsyncThunk, type PayloadAction  } from "@reduxjs/toolkit";
import axios from 'axios';

const  BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

interface SearchResult {
  _id: string;
  type: "twitter" | "youtube" | "article" | "note";
  link?: string;
  description: string;
  title: string;
  tags: Array<{_id:string; tag:string}>;
  relevanceScore: number;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  totalResults: number;
  suggestions: string[];
  suggestionsLoading: boolean;
}

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  totalResults: 0,
  suggestions: [],
  suggestionsLoading: false,
}


// Async thunk for semantic search
export const performSemanticSearch = createAsyncThunk(
  'search/performSemanticSearch',

  async({
    query, 
    token, 
    limit = 10,
    contentType,
    tags 
  }: {
    query: string; 
    token: string; 
    limit?: number;
    contentType?: string[];
    tags?: string[];
  }) => {
    const params: any = { query, limit };
    
    if (contentType && contentType.length > 0) {
      params.contentType = contentType.join(',');
    }
    
    if (tags && tags.length > 0) {
      params.tags = tags.join(',');
    }

    const response = await axios.get(`${BACKEND_URL}/api/v1/search`, {
      params,
      headers: { Authorization: token },
    });
    return response.data.data;
  }
);

// Async thunk for search suggestions
export const fetchSearchSuggestions = createAsyncThunk(
  'search/fetchSuggestions',
  async ({ prefix, token }: { prefix: string; token: string }) => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/search/suggestions`, {
      params: { prefix },
      headers: { Authorization: token },
    });
    return response.data.data.suggestions || [];
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    clearSearch: (state) => {
      state.query = '';
      state.results = [];
      state.error = null;
      state.totalResults = 0;
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Search
      .addCase(performSemanticSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(performSemanticSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.query = action.payload.query;
        state.totalResults = action.payload.totalResults;
      })
      .addCase(performSemanticSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Search failed';
      })
      // Suggestions
      .addCase(fetchSearchSuggestions.pending, (state) => {
        state.suggestionsLoading = true;
      })
      .addCase(fetchSearchSuggestions.fulfilled, (state, action) => {
        state.suggestionsLoading = false;
        state.suggestions = action.payload;
      })
      .addCase(fetchSearchSuggestions.rejected, (state) => {
        state.suggestionsLoading = false;
        state.suggestions = [];
      });
    }
})

export const { setQuery, clearSearch, clearSuggestions } = searchSlice.actions;
export default searchSlice.reducer;
