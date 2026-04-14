import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FirmState {
  value: {
    id: string;
    name: string;
    role: string;
    subscriptionExp?:boolean
  };
}

const initialState: FirmState = {
  value: { id: '', name: '', role: "" , subscriptionExp:false },
};

export const firmSlice = createSlice({
  name: 'firm',
  initialState,
  reducers: {
    setFirmDetails: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        role: string;
        subscriptionExp?:boolean
      }>,
    ) => {
      state.value = action.payload;
    },
  },
});
export const { setFirmDetails } = firmSlice.actions;

export default firmSlice.reducer;
