import React from 'react';
import { useDispatch } from 'react-redux';
import { setEmail, setPassword } from '../redux/slices/authSlice';
import LoadingButton from './LoadingButton';

interface SignInFormProps {
  email: string;
  pass: string; // Renamed to avoid conflict with 'password' prop name if it was a native attribute
  isLoading: boolean;
  handleSignIn: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onForgotPasswordClick: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ email, pass, isLoading, handleSignIn, onForgotPasswordClick }) => {
  const dispatch = useDispatch();

  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="signin-email" className="block font-semibold text-gray-700 mb-1.5 text-sm">
          Enter your email<span className="text-red-500">*</span>
        </label>
        <input
          id="signin-email" type="email" placeholder="email@email.com"
          className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#20BFA9] focus:border-[#20BFA9] disabled:bg-gray-50 text-sm placeholder-gray-400"
          value={email}
          onChange={(e) => dispatch(setEmail(e.target.value.trim()))}
          required disabled={isLoading}
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label htmlFor="signin-password" className="block font-semibold text-gray-700 text-sm">
            Enter password<span className="text-red-500">*</span>
          </label>
          <button type="button" className="text-xs text-gray-500 hover:text-[#20BFA9] hover:underline" onClick={onForgotPasswordClick} disabled={isLoading}>
            Forgot password?
          </button>
        </div>
        <input
          id="signin-password" type="password" placeholder="Password"
          className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#20BFA9] focus:border-[#20BFA9] disabled:bg-gray-50 text-sm placeholder-gray-400"
          value={pass}
          onChange={(e) => dispatch(setPassword(e.target.value))}
          required disabled={isLoading}
        />
      </div>
      <LoadingButton type="button" onClick={handleSignIn} isLoading={isLoading} loadingText="Signing in...">
        Sign in
      </LoadingButton>
    </form>
  );
};

export default SignInForm;