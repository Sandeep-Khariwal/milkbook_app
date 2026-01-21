import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface CustomerState {
  value: {
    id: string;
    name: string;
  };
}

const initialState: CustomerState = {
  value: { id: '', name: '' },
};

export const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomerDetails: (
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
export const { setCustomerDetails } = customerSlice.actions;

export default customerSlice.reducer;
