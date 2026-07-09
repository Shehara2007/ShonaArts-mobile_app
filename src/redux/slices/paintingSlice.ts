import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Painting, PaintingFilters } from '../../types';

interface PaintingState {
  paintings: Painting[];
  selectedPainting: Painting | null;
  filters: PaintingFilters;
  loading: boolean;
  error: string | null;
}

const initialState: PaintingState = {
  paintings: [],
  selectedPainting: null,
  filters: {
    search: '',
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    sortBy: 'newest',
  },
  loading: false,
  error: null,
};

const paintingSlice = createSlice({
  name: 'painting',
  initialState,
  reducers: {
    setPaintings: (state, action: PayloadAction<Painting[]>) => {
      state.paintings = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedPainting: (state, action: PayloadAction<Painting | null>) => {
      state.selectedPainting = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<PaintingFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addPainting: (state, action: PayloadAction<Painting>) => {
      state.paintings.push(action.payload);
    },
    updatePainting: (state, action: PayloadAction<Painting>) => {
      const index = state.paintings.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.paintings[index] = action.payload;
      }
    },
    removePainting: (state, action: PayloadAction<string>) => {
      state.paintings = state.paintings.filter(p => p.id !== action.payload);
    },
  },
});

export const {
  setPaintings,
  setSelectedPainting,
  setFilters,
  resetFilters,
  setLoading,
  setError,
  addPainting,
  updatePainting,
  removePainting,
} = paintingSlice.actions;

export default paintingSlice.reducer;
