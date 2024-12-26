import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import householdsReducer from './householdsSlice';
import choresReducer from './choresSlice';

const householdsPersistConfig = {
  key: 'households',
  storage: AsyncStorage,
  whitelist: ['selectedHouseholdId'], // only persist selectedHouseholdId
};

const persistedHouseholdsReducer = persistReducer(
  householdsPersistConfig,
  householdsReducer
);

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    households: persistedHouseholdsReducer,
    chores: choresReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(api.middleware),
});

export const persistor = persistStore(store);

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
