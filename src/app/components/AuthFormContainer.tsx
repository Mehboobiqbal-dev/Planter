import React, { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveTab, setShowForgotPassword } from '../redux/slices/authSlice';
import { RootState } from '../redux/types'; // Adjust path if needed

import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import SocialSignInButtons from '../components/SocialButtons';

interface AuthFormContainerProps {
  authState: RootState['auth'];
  currentError: string;
  onSocialSignIn: (provider: string) => void;
  handleSignIn: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleSignUp: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleForgotPassword: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const AuthFormContainer: React.FC<AuthFormContainerProps> = ({ authState, currentError, onSocialSignIn, handleSignIn, handleSignUp, handleForgotPassword }) => {
  const dispatch = useDispatch();
  const {
    activeTab,
    showForgotPassword,
    isLoading,
    forgotMessage,
    email,
    password,
    name,
    confirmPassword,
    termsAccepted,
    notificationsAccepted,
    forgotEmail
  } = authState;

  const renderedForm = useMemo(() => {
    if (showForgotPassword) {
      return <ForgotPasswordForm
          forgotEmail={forgotEmail} isLoading={isLoading}
          handleForgotPassword={handleForgotPassword}
          onBackToSignInClick={() => dispatch(setShowForgotPassword(false))}
        />;
    }
    if (activeTab === 'signin') {
      return <SignInForm
          email={email} pass={password} isLoading={isLoading}
          handleSignIn={handleSignIn}
          onForgotPasswordClick={() => dispatch(setShowForgotPassword(true))}
        />;
    }
    return <SignUpForm
        name={name} email={email} pass={password} confirmPass={confirmPassword}
        termsAccepted={termsAccepted} notificationsAccepted={notificationsAccepted}
        isLoading={isLoading} handleSignUp={handleSignUp}
      />;
  }, [showForgotPassword, activeTab, authState, handleSignIn, handleSignUp, handleForgotPassword, dispatch]);


  return (
    <div className="w-full md:w-1/2 flex flex-col items-center md:items-stretch md:justify-center md:bg-white md:overflow-y-auto">
      <div className="w-full max-w-md md:max-w-none p-4 sm:p-0 md:px-8 lg:px-12 flex flex-col items-center md:py-10 md:h-full md:justify-center">
        {/* Mobile-only Header */}
        <div className="text-center mt-12 sm:mt-8 mb-5 md:hidden">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3 leading-tight">One solution for all<br />the platforms</h1>
            <div className="mx-auto w-[100px] h-[65px] sm:w-[120px] sm:h-[75px]">
              <img src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fweb_design_1_2f721fecd6.webp&w=256&q=75" alt="Platforms illustration" className="w-full h-full object-contain" />
            </div>
        </div>
        
        {/* Form Card */}
        <div className="bg-white md:bg-transparent rounded-xl md:rounded-none shadow-xl md:shadow-none p-6 sm:p-8 md:p-0 w-full">
          <div className="flex border-b-2 border-gray-200 mb-6 sm:mb-8">
            <button onClick={() => { dispatch(setActiveTab('signin')); dispatch(setShowForgotPassword(false)); }}
              className={`flex-1 text-center py-2.5 sm:py-3 font-semibold text-base sm:text-lg transition-colors ${activeTab === 'signin' && !showForgotPassword ? 'text-[#20BFA9] border-b-2 border-[#20BFA9]' : 'text-gray-400 hover:text-[#20BFA9]'}`}>
              Sign in
            </button>
            <button onClick={() => { dispatch(setActiveTab('signup')); dispatch(setShowForgotPassword(false)); }}
              className={`flex-1 text-center py-2.5 sm:py-3 font-semibold text-base sm:text-lg transition-colors ${activeTab === 'signup' && !showForgotPassword ? 'text-[#20BFA9] border-b-2 border-[#20BFA9]' : 'text-gray-400 hover:text-[#20BFA9]'}`}>
              Sign up
            </button>
          </div>

          {currentError && (<div className="text-red-600 text-center mb-4 font-medium p-3 bg-red-100 border border-red-200 rounded-md text-sm">{currentError}</div>)}
          {forgotMessage && !currentError && (<div className="text-green-600 text-center mb-4 font-medium p-3 bg-green-100 border border-green-200 rounded-md text-sm">{forgotMessage}</div>)}

          <SocialSignInButtons onSocialSignIn={onSocialSignIn} isLoading={isLoading} />

          <div className="flex items-center mb-6 sm:mb-8">
            <hr className="flex-grow border-t border-gray-200" />
            <span className="mx-3 sm:mx-4 text-gray-400 text-xs sm:text-sm">Or</span>
            <hr className="flex-grow border-t border-gray-200" />
          </div>

          {renderedForm}
        </div>
        <div className="pb-8 md:hidden"></div> {/* Extra space for mobile */}
      </div>
    </div>
  );
};

export default AuthFormContainer;