'use client'; // Required for client-side components in Next.js App Router

import React, { useState } from 'react';

interface Device {
  name: string;
  imgSrc: string;
  description: string;
  icon: JSX.Element;
}

const SubscriptionPage: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
  
    // FAQ data with questions and answers
    const faqs = [
      {
        question: "What do I get with the trial subscription?",
        answer: "You’ll have full access to all premium features for 3 days. The subscription includes limitless plant identification, disease diagnosis by photo, a watering calculator, and more!",
      },
      {
        question: "How to update my subscription?",
        answer: "Unless you cancel at least 24 hours before the end of the trial period, you will be automatically charged a price indicated on the payment screen for a chosen subscription period.",
      },
      {
        question: "Does the subscription give access to the app?",
        answer: "Basic and premium subscriptions are fully synced between the app and desktop, giving you access to all features on both platforms. Your accounts are linked, so the subscription stays in sync across devices.",
      },
      {
        question: "Is the PlantIn app free?",
        answer: "You can sign up for free and access features like identifying and caring for up to 3 plants, along with joining our Plant Heroes community. To unlock more plants and extra features, you'll need a premium plan.",
      },
      {
        question: "What is the PlantIn Premium?",
        answer: "PlantIn Premium is a subscription that gives you access to all features, including unlimited plant identification and disease diagnosis, treatment guides, plant care tools, weed articles, etc. All subscriptions are basically Premium.",
      }
    ];
  
    // Toggle FAQ open/close
    const toggleFaq = (index: number) => {
      setOpenFaq(openFaq === index ? null : index);
    };
  const devices: Device[] = [
    {
      name: 'Desktop',
      imgSrc:
        'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FIl1_98f3fa5d5e.webp%3Fupdated_at%3D2022-09-23T13%3A30%3A52.474Z&w=3840&q=75',
      description:
        'Enjoy PlantIn on your desktop. Access plant care tools and expert articles – all with one subscription, just a click away!',
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3" />
          <path d="M3 13h18" />
          <path d="M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Tablet',
      imgSrc:
        'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FIl2_f8ad091ce3.webp%3Fupdated_at%3D2022-09-23T13%3A30%3A52.592Z&w=3840&q=75',
      description:
        'View your plant collection anytime, anywhere. Our subscription activates PlantIn assistant on all your devices.',
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 18h.01" />
          <path d="M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      name: 'Mobile',
      imgSrc:
        'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FIl3_f1409b29ef.webp%3Fupdated_at%3D2022-09-23T13%3A30%3A52.279Z&w=3840&q=75',
      description:
        'Identify plants while sitting at home, walking in the park, or traveling in a different country. PlantIn is always ready to help.',
      icon: (
        <svg
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 18h.01" />
          <path d="M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const [activeDevice, setActiveDevice] = useState<string>(devices[0].name);
  const current: Device | undefined = devices.find((dev) => dev.name === activeDevice);

  // Fallback for undefined current
  if (!current) {
    return <div>Error: Device not found</div>;
  }

  return (
    <div className="bg-white flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Main Content Container */}
      <div className="max-w-6xl w-full space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            How much does PlantIn cost?
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Get a 3-day trial to explore PlantIn before your subscription really begins.
          </p>
        </div>

        {/* Main Layout: Plans on Left, Features on Right */}
        <div className="flex flex-col md:flex-row md:space-x-8">
          {/* Pricing Plans (Left Side, Vertical List) */}
          <div className="w-full md:w-1/2 space-y-6">
            {/* 90 Days Access */}
            <div className="bg-gray-50 rounded-2xl shadow border border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input type="radio" name="plan" className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">90 Days Access</h3>
                  <p className="text-sm text-gray-500">3-day trial</p>
                  <p className="text-sm text-gray-500">$2.00 per day</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">$59.99</p>
                <div className="flex justify-end items-center space-x-2">
                  <p className="text-sm text-gray-500 line-through">$89.54</p>
                  <p className="text-sm text-red-500 font-medium bg-red-100 px-2 py-1 rounded-full">-33%</p>
                </div>
              </div>
            </div>

            {/* 7 Days Access */}
            <div className="bg-gray-50 rounded-2xl shadow border border-gray-200 p-6 flex items-center justify-between relative">
              <div className="flex items-center space-x-4">
                <input type="radio" name="plan" className="h-5 w-5 text-green-500" defaultChecked />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">7 Days Access</h3>
                  <p className="text-sm text-gray-500">3-day trial</p>
                  <p className="text-sm text-gray-500">$1.43 per day</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">$9.99</p>
              </div>
              <span className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            {/* 30 Days Access */}
            <div className="bg-gray-50 rounded-2xl shadow border border-gray-200 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input type="radio" name="plan" className="h-5 w-5 text-green-500" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Exclusive 30 Days Access</h3>
                  <p className="text-sm text-gray-500">3-day trial</p>
                  <p className="text-sm text-gray-500">$1.33 per day</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">$39.99</p>
              </div>
            </div>
          </div>

          {/* Features Section (Right Side) */}
          <div className="w-full md:w-1/2 mt-8 md:mt-0">
            <div className="bg-emerald-400 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900">All plans include</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">Accurate Plant Identifier</span>
                  <span className="h-5 w-5 text-white text-right mr-3">?</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">Pro Disease Diagnosis Tool</span>
                  <span className="h-5 w-5 text-white text-right mr-3">?</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">Helpful Plant Care Reminders</span>
                  <span className="h-5 w-5 text-white text-right mr-3">?</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">Unlimited Plant Care Plans</span>
                  <span className="h-5 w-5 text-white text-right mr-3">?</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">Moon Elchg Calendar</span>
                  <span className="h-5 w-5 text-white text-right mr-3">?</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">Precise Light Meter Tool</span>
                  <span className="h-5 w-5 text-white text-right mr-3">?</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-gray-700">Efficient Water Calculator</span>
                  <span className="h-5 w-5 text-white text-right mr-3">?</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Cross-Device Section */}
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row items-center lg:items-start">
          {/* Left Side: Image */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <img
              src={current.imgSrc}
              alt={current.name}
              className="w-full max-w-md"
            />
          </div>

          {/* Right Side: Heading, Tabs, and Description */}
          <div className="w-full lg:w-1/2 mt-8 lg:mt-0 text-center lg:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              One subscription for all devices
            </h2>
            {/* Green underline exactly as in the reference image */}
            <div className=" mx-auto lg:mx-0 mt-2"></div>

            {/* Device Tabs */}
            <div className="mt-6 flex justify-center lg:justify-start space-x-12">
              {devices.map((dev) => {
                const isActive = dev.name === activeDevice;
                return (
                  <button
                    key={dev.name}
                    onClick={() => setActiveDevice(dev.name)}
                    className="flex flex-col items-center focus:outline-none"
                  >
                    {/* Icon: change color based on active/inactive */}
                    <div
                      className={`${
                        isActive ? 'text-green-500' : 'text-gray-600'
                      }`}
                    >
                      {dev.icon}
                    </div>
                    {/* Label: change color based on active/inactive */}
                    <p
                      className={`mt-2 font-medium ${
                        isActive ? 'text-green-500' : 'text-gray-700'
                      }`}
                    >
                      {dev.name}
                    </p>
                    {/* Active indicator dot below label */}
                    {isActive && <div className="mt-1 h-1 w-4 bg-green-500 rounded"></div>}
                  </button>
                );
              })}
            </div>

            {/* Description Paragraph */}
            <p className="mt-4 text-gray-600 max-w-lg mx-auto lg:mx-0">
              {current.description}
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center">FAQ</h2>
          <div className="mt-6 space-y-4 max-w-2xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-800 font-semibold">{faq.question}</p>
                  <button
                    type="button"
                    className="text-gray-600 text-xl font-bold"
                    onClick={() => toggleFaq(index)}
                  >
                    {openFaq === index ? '−' : '+'}
                  </button>
                </div>
                {openFaq === index && (
                  <p className="mt-2 text-gray-600 text-sm">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Money Back Guarantee */}
      <div className="bg-blue-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between">
  <div className="md:w-1/2 text-left">
    <h2 className="text-lg font-bold text-gray-900">Money back guarantee</h2>
    <p className="mt-2 text-gray-600 max-w-sm text-sm">
      Your green friends will bloom and blossom, guaranteed. If things go wrong, we'll send your money back. We know they'll thrive though.
    </p>
  </div>
  <div className="md:w-1/3 mt-3 md:mt-0 flex justify-center">
    <img
      src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fsafety_1_6105fb8166.webp&w=640&q=75"
      alt="Money back guarantee"
      className="max-w-[75%] h-auto rounded-lg"
    />
  </div>
</div>
      </div>
    </div>
  );
};

export default SubscriptionPage;