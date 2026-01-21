import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface DistributerState {
  value: {
    id: string;
    name: string;
  };
}

const initialState: DistributerState = {
  value: { id: '', name: '' },
};

export const distributerSlice = createSlice({
  name: 'distributer',
  initialState,
  reducers: {
    setDistributerDetails: (
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
export const { setDistributerDetails } = distributerSlice.actions;

export default distributerSlice.reducer;
