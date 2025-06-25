import React from 'react';
import { useDispatch } from 'react-redux';
import { setName, setEmail, setPassword, setConfirmPassword, setTermsAccepted, setNotificationsAccepted } from '../redux/slices/authSlice';
import LoadingButton from './LoadingButton';

interface SignUpFormProps {
  name: string;
  email: string;
  pass: string;
  confirmPass: string;
  termsAccepted: boolean;
  notificationsAccepted: boolean;
  isLoading: boolean;
  handleSignUp: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ name, email, pass, confirmPass, termsAccepted, notificationsAccepted, isLoading, handleSignUp }) => {
  const dispatch = useDispatch();
  
  return (
    <form className="space-y-4 sm:space-y-3" onSubmit={(e) => e.preventDefault()}>
       <div>
          <label htmlFor="signup-name" className="block font-semibold text-gray-700 mb-1.5 text-sm">Enter your name <span className="text-red-500">*</span></label>
          <input id="signup-name" type="text" placeholder="Your name"
            className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#20BFA9] focus:border-[#20BFA9] disabled:bg-gray-50 text-sm placeholder-gray-400"
            value={name} onChange={(e) => dispatch(setName(e.target.value))} required disabled={isLoading} />
        </div>
        <div>
          <label htmlFor="signup-email" className="block font-semibold text-gray-700 mb-1.5 text-sm">Enter your email <span className="text-red-500">*</span></label>
          <input id="signup-email" type="email" placeholder="email@email.com"
            className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#20BFA9] focus:border-[#20BFA9] disabled:bg-gray-50 text-sm placeholder-gray-400"
            value={email} onChange={(e) => dispatch(setEmail(e.target.value.trim()))} required disabled={isLoading} />
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-4 sm:space-y-0">
          <div className="w-full sm:w-1/2">
            <label htmlFor="signup-password"className="block font-semibold text-gray-700 mb-1.5 text-sm">Enter password <span className="text-red-500">*</span></label>
            <input id="signup-password" type="password" placeholder="Password (min 6 chars)"
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#20BFA9] focus:border-[#20BFA9] disabled:bg-gray-50 text-sm placeholder-gray-400"
              value={pass} onChange={(e) => dispatch(setPassword(e.target.value))} required disabled={isLoading} />
          </div>
          <div className="w-full sm:w-1/2">
            <label htmlFor="signup-confirm-password"className="block font-semibold text-gray-700 mb-1.5 text-sm">Confirm password <span className="text-red-500">*</span></label>
            <input id="signup-confirm-password" type="password" placeholder="Confirm password"
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#20BFA9] focus:border-[#20BFA9] disabled:bg-gray-50 text-sm placeholder-gray-400"
              value={confirmPass} onChange={(e) => dispatch(setConfirmPassword(e.target.value))} required disabled={isLoading} />
          </div>
        </div>
        <div className="pt-1 space-y-2.5">
            <div className="flex items-start space-x-2 sm:space-x-3">
            <input id="terms-accepted" type="checkbox" checked={termsAccepted} onChange={(e) => dispatch(setTermsAccepted(e.target.checked))}
                className="mt-0.5 sm:mt-1 h-4 w-4 rounded border-gray-300 text-[#20BFA9] focus:ring-[#20BFA9] disabled:opacity-70" disabled={isLoading} />
            <label htmlFor="terms-accepted" className="text-xs text-gray-500">
                I agree to the{' '} <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#20BFA9] font-medium hover:underline">Privacy Policy, Terms of Service</a>{' '}and{' '}
                <a href="/subscription" target="_blank" rel="noopener noreferrer" className="text-[#20BFA9] font-medium hover:underline">Subscription Policy</a>
            </label>
            </div>
            <div className="flex items-start space-x-2 sm:space-x-3">
            <input id="notifications-accepted" type="checkbox" checked={notificationsAccepted} onChange={(e) => dispatch(setNotificationsAccepted(e.target.checked))}
                className="mt-0.5 sm:mt-1 h-4 w-4 rounded border-gray-300 text-[#20BFA9] focus:ring-[#20BFA9] disabled:opacity-70" disabled={isLoading} />
            <label htmlFor="notifications-accepted" className="text-xs text-gray-500">I agree to receive important notifications and updates via email</label>
            </div>
        </div>
        <LoadingButton type="button" onClick={handleSignUp} isLoading={isLoading} loadingText="Signing up..." disabled={!termsAccepted} className="!mt-5">
            Sign up
        </LoadingButton>
    </form>
  );
};

export default SignUpForm;