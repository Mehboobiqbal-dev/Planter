'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface FAQ {
  question: string;
  answer: string;
}

const About: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: 'How does Elch identify plants?',
      answer:
        'Elch uses a custom machine learning model to identify over 17,000 plant species with 95.8% accuracy. Simply scan the plant using your smartphone, tablet, or laptop camera.',
    },
    {
      question: 'What is the "Ask The Botanist" feature?',
      answer:
        'Our "Ask The Botanist" feature connects you with certified botanists available 24/7 to provide personalized advice for your plant care needs.',
    },
    {
      question: 'Is Elch available on multiple platforms?',
      answer:
        'Yes, Elch is available on iOS, Android, and the web, making it accessible to over 22 million users worldwide.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome to Elch */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Elch</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Elch is your virtual gardening companion, designed to connect humans with nature. We empower green thumbs with personalized plant care plans, leveraging our custom ML model that identifies over 16,000 plant species with 95.8% accuracy and detects dozens of plant diseases. Connect with botany experts for tailored advice and join our global community of plant enthusiasts to care, share, and learn.
          </p>
        </section>

        {/* Educate with Fun */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Educate with Fun</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Elch, we believe in edutainment. Spend time with our app to deepen your plant knowledge through articles (online & offline), quizzes to test your skills, and real-time scanning for instant care tips. The more you engage, the more you discover about the plants around you.
          </p>
        </section>

        {/* Care Effortlessly */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Care Effortlessly</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Identify plants instantly by scanning with your smartphone, tablet, or laptop. Use our light meter and watering calculator to optimize conditions for your green pets. Arrange your space with customized disease treatment guides and enjoy hands-on learning to grow lusher, healthier plants.
          </p>
        </section>

        {/* Consult with Experts */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Consult with Experts</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Elch offers a personalized experience for all plant lovers. Our certified botanists are available 24/7 via the "Ask The Botanist" feature to address your plant care challenges. We cherish individual requests and celebrate unique cases—will yours be the next one-of-a-kind?
          </p>
        </section>

        {/* Sustainable Innovation */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Sustainable Innovation</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We’re committed to combating climate change and promoting biodiversity. Elch uses cutting-edge AR technologies to make plant care accessible and engaging, helping people worldwide transform their homes into greener spaces. Start your planting journey with us and make the planet a better place.
          </p>
        </section>

        {/* Our Testimonials */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Testimonials</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We’re proud to be ranked #1 in the App Store and Google Play "Education" category. With over 22 million monthly users across the USA, Australia, UK, and Mexico, Elch is trusted globally. Join our community on iOS, Android, or web and see why millions love us.
          </p>
        </section>

        {/* Become a Plant Hero */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Become a Plant Hero</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Plants have feelings, just like people. At Elch, we respect their needs and inspire you to enrich your gardening experience. Our mission is to bridge humans and nature, proving that gardening is simple. Not all heroes wear capes—some grow plants. Join the Elch family today!
          </p>
        </section>

        {/* FAQ Section */}
        <section className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg bg-white shadow-sm"
              >
                <button
                  className="w-full flex justify-between items-center px-4 py-3 text-left text-lg font-medium text-gray-900 hover:bg-gray-50 focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span>{faq.question}</span>
                  {openFAQ === index ? (
                    <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
                {openFAQ === index && (
                  <div className="px-4 py-3 bg-gray-50 text-gray-700 text-base">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
