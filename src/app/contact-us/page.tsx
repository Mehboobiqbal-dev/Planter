import React from 'react';

const ContactUsPage: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-between p-6 md:p-10 bg-gray-50 min-h-screen">
      {/* Left Section - Contact Form */}
      <div className="w-full md:w-1/2 p-6 md:p-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-6">If you need some help, fill out the form below and we’ll get back to you ASAP.</p>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address*</label>
            <input
              type="email"
              placeholder="email@email.com"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Your name</label>
            <input
              type="text"
              placeholder="Kevin Smith"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Message*</label>
            <textarea
              placeholder="I want to ask about my plant"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              rows={4}
            />
          </div>
         <button
  className="rounded-[30px] font-semibold text-white flex items-center justify-center text-[18px] w-1/2 h-[140%] bg-gradient-to-r from-[#04BF94] to-[#52C8AD] shadow-xl hover:shadow-lg shadow-[#0000000D] hover:from-[#06D3A4] hover:to-[#60E7C8] mt-8 cursor-not-allowed opacity-50"
  disabled
>
  Send
</button>


        </form>
      </div>

      {/* Right Section - FAQ and Info */}
      <div className="w-full md:w-1/2 p-6 md:p-10 bg-blue-50 rounded-lg shadow-md mt-6 md:mt-0 md:ml-6">
        <h2 className="text-xl font-semibold mb-4">Want to ask the question? Let’s look at it in FAQ first!</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>Vortemol Limited</span>
          </div>
          <div className="flex items-center">
            <span>Florinis 7, Greg Tower, 2nd Floor, 1065, Nicosia, Cyprus</span>
          </div>
          <div className="flex items-center">
            <svg className="w-6 h-6 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span>support@plantin.xyz</span>
          </div>
          <p className="text-gray-600">When contacting us, please indicate the email that you are registered with.</p>
          {/* Placeholder for image - replace with your image component later */}
          {/* <img src="/path-to-your-image.jpg" alt="Contact Image" className="mt-4" /> */}
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;