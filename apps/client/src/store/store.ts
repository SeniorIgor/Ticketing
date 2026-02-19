import { combineReducers, configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/authSlice';

export const rootReducer = combineReducers({
  auth: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppPreloadedState = Partial<RootState>;

export const makeStore = (preloadedState?: AppPreloadedState) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: process.env.NODE_ENV !== 'production',
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
