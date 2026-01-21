import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface AdminState {
  value: {
    id: string;
    name: string;
  };
}

const initialState: AdminState = {
  value: { id: '', name: '' },
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setAdminDetails: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
      }>,
    ) => {
      state.value = action.payload;
    },
  },
});
export const { setAdminDetails } = adminSlice.actions;

export default adminSlice.reducer;
