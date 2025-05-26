import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  forgotEmail: string;
  error: string;
  forgotMessage: string;
  termsAccepted: boolean;
  notificationsAccepted: boolean;
  isLoading: boolean;
  activeTab: 'signin' | 'signup';
  showForgotPassword: boolean;
  accessToken: string | null; // Add accessToken to store JWT
}

const initialState: AuthState = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  forgotEmail: '',
  error: '',
  forgotMessage: '',
  termsAccepted: false,
  notificationsAccepted: false,
  isLoading: false,
  activeTab: 'signin',
  showForgotPassword: false,
  accessToken: null, // Initialize accessToken as null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setEmail: (state, action: PayloadAction<string>) => {
      state.email = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setConfirmPassword: (state, action: PayloadAction<string>) => {
      state.confirmPassword = action.payload;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setForgotEmail: (state, action: PayloadAction<string>) => {
      state.forgotEmail = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    setForgotMessage: (state, action: PayloadAction<string>) => {
      state.forgotMessage = action.payload;
    },
    setTermsAccepted: (state, action: PayloadAction<boolean>) => {
      state.termsAccepted = action.payload;
    },
    setNotificationsAccepted: (state, action: PayloadAction<boolean>) => {
      state.notificationsAccepted = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setActiveTab: (state, action: PayloadAction<'signin' | 'signup'>) => {
      state.activeTab = action.payload;
      state.showForgotPassword = false;
    },
    setShowForgotPassword: (state, action: PayloadAction<boolean>) => {
      state.showForgotPassword = action.payload;
    },
    setAccessToken: (state, action: PayloadAction<string | null>) => {
      state.accessToken = action.payload;
    },
    resetAuthState: (state) => {
      return { ...initialState, activeTab: state.activeTab };
    },
  },
});

export const {
  setEmail,
  setPassword,
  setConfirmPassword,
  setName,
  setForgotEmail,
  setError,
  setForgotMessage,
  setTermsAccepted,
  setNotificationsAccepted,
  setIsLoading,
  setActiveTab,
  setShowForgotPassword,
  setAccessToken,
  resetAuthState,
} = authSlice.actions;

export default authSlice.reducer;