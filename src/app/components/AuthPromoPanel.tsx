import React, { useMemo } from 'react';

interface AuthPromoPanelProps {
  activeTab: 'signin' | 'signup';
  showForgotPassword?: boolean;
}

const AuthPromoPanel: React.FC<AuthPromoPanelProps> = ({ activeTab, showForgotPassword }) => {
  const promoContent = useMemo(() => {
    if (activeTab === 'signin' && !showForgotPassword) {
      return (
        <div className="p-8 bg-white/70 backdrop-blur-md rounded-lg shadow-xl">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-4">Having troubles with your plants? Ask the botanist!</h2>
          <p className="text-xl text-gray-700 mb-6">To get a personalized answer:</p>
          <ul className="m-0 p-0 text-lg list-none space-y-3 text-left">
            <li className="flex items-start"><span className="text-2xl text-green-600 font-bold mr-3">•</span><span className="font-semibold text-gray-700">Use botanist help feature</span></li>
            <li className="flex items-start"><span className="text-2xl text-green-600 font-bold mr-3">•</span><span className="font-semibold text-gray-700">Formulate your question & attach photos</span></li>
            <li className="flex items-start"><span className="text-2xl text-green-600 font-bold mr-3">•</span><span className="font-semibold text-gray-700">Receive an answer within 24 hours</span></li>
          </ul>
        </div>
      );
    }
    // Default content for 'signup' and 'forgotPassword' states
    return (
      <div className="p-8 bg-white/70 backdrop-blur-md rounded-lg shadow-xl">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-800 mb-6">With PlantIn you can</h2>
        <ul className="m-0 p-0 text-lg list-none space-y-3 text-left">
          <li className="flex items-start"><span className="text-2xl text-green-600 font-bold mr-3">•</span><span className="font-semibold text-gray-700">Discover any plant in seconds</span></li>
          <li className="flex items-start"><span className="text-2xl text-green-600 font-bold mr-3">•</span><span className="font-semibold text-gray-700">Become a green thumb with our blog</span></li>
          <li className="flex items-start"><span className="text-2xl text-green-600 font-bold mr-3">•</span><span className="font-semibold text-gray-700">Identify and cure plant diseases</span></li>
          <li className="flex items-start"><span className="text-2xl text-green-600 font-bold mr-3">•</span><span className="font-semibold text-gray-700">Get personalized help from experts</span></li>
        </ul>
      </div>
    );
  }, [activeTab, showForgotPassword]);

  return (
    <div
      className="hidden md:flex md:w-1/2 flex-col justify-center items-center space-y-6 min-h-screen px-12 bg-green-100 text-center"
      style={{ backgroundImage: `url('https://strapi.myplantin.com/Sign_up_Illustration_6a13a81c32.webp')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
    >
      {promoContent}
    </div>
  );
};

export default AuthPromoPanel;