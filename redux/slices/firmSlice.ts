import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FirmState {
  value: {
    id: string;
    name: string;
    role: string;
  };
}

const initialState: FirmState = {
  value: { id: '', name: '', role: "" },
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
      }>,
    ) => {
      state.value = action.payload;
    },
  },
});
export const { setFirmDetails } = firmSlice.actions;

export default firmSlice.reducer;
