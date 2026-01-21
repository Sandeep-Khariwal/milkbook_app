// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import firmSlice from './slices/firmSlice';
import adminSlice from './slices/adminSlice';
import customerSlice from './slices/customerSlice';
import distributerSlice from './slices/distributerSlice';
import  farmerSlice  from './slices/farmerSlice';

export const store = configureStore({
  reducer: {
    firm: firmSlice,
    admin: adminSlice,
    customer: customerSlice,
    farmer:farmerSlice,
    distributer: distributerSlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
