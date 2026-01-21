import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FarmerState {
  value: {
    id: string;
    name: string;
  };
}

const initialState: FarmerState = {
  value: { id: '', name: '' },
};

export const farmerSlice = createSlice({
  name: 'farmer',
  initialState,
  reducers: {
    setFarmerDetails: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
      }>
    ) => {
      state.value = action.payload;
    },
  },
});
export const { setFarmerDetails } = farmerSlice.actions;

export default farmerSlice.reducer;
