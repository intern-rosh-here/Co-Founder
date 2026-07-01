import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import profileReducer from './profileSlice';
import browseReducer from './browseSlice'; 
import matchReducer from './matchSlice';
import messageReducer from './messageSlice';
import notificationReducer from './notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    browse: browseReducer,
    match: matchReducer,
    message: messageReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['notification/addNotification'],
      },
    }),
});

export default store;

