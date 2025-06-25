import React from 'react';
import { useDispatch } from 'react-redux';
import { setForgotEmail } from '../redux/slices/authSlice';
import LoadingButton from './LoadingButton';

interface ForgotPasswordFormProps {
  forgotEmail: string;
  isLoading: boolean;
  handleForgotPassword: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onBackToSignInClick: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ forgotEmail, isLoading, handleForgotPassword, onBackToSignInClick }) => {
  const dispatch = useDispatch();

  return (
    <form className="space-y-5 sm:space-y-6" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label htmlFor="forgot-email" className="block font-semibold text-gray-700 mb-1.5 text-sm">
          Enter your email <span className="text-red-500">*</span>
        </label>
        <input
          id="forgot-email" type="email" placeholder="email@email.com"
          className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#20BFA9] focus:border-[#20BFA9] disabled:bg-gray-50 text-sm placeholder-gray-400"
          value={forgotEmail}
          onChange={(e) => dispatch(setForgotEmail(e.target.value.trim()))}
          required disabled={isLoading}
        />
      </div>
      <LoadingButton type="button" onClick={handleForgotPassword} isLoading={isLoading} loadingText="Sending...">
        Send Reset Link
      </LoadingButton>
      <button type="button" onClick={onBackToSignInClick} className="text-sm text-gray-500 hover:underline w-full text-center pt-1 sm:pt-2" disabled={isLoading}>
        Back to Sign In
      </button>
    </form>
  );
};

export default ForgotPasswordForm;