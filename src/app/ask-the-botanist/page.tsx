"use client";
import React, { useState } from "react";
import Link from "next/link";

const AskTheBotanist: React.FC = () => {
  // State to manage which FAQ is open
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // FAQ data with questions and answers
  const faqs = [
    {
      question: "How long does it take to receive an answer?",
      answer: "Typically, it takes no longer than 24 hours to get an answer back from the Botanist. Complex issues make our Botanists research a little longer: let them do their best.",
    },
    {
      question: "Who are your Botanists?",
      answer: "Our experts are certified niche specialists. We interview every Botanist to make sure they’re ready to become a part of our PlantIn team and provide the best help to our clients.",
    },
    {
      question: "What can I ask?",
      answer: "You can ask absolutely anything when it comes to plants. Consult on plant species, diseases, treatments, care requirements (watering, propagation, pruning, fertilizing, misting, repotting etc). Also, we collect the most unusual requests — would you be the one-of-a-kind?",
    },
    {
      question: "How do I receive my answer?",
      answer: "Once your response is ready, you will receive an email with all the details. You may also see the conversation in your personal account on the website - review it, rate it and give us feedback.",
    },
  ];

  // Toggle FAQ open/close
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col">
      {/* Main Content */}
      <div className="w-full">
        <header
          className="shadow flex flex-wrap md:flex-nowrap"
          style={{ background: 'linear-gradient(to right, #DDF9D5, #BEFFE4)', minHeight: '300px' }}
        >
          <div className="p-6 w-full md:w-1/2">
            <div className="flex-grow flex items-start justify-start text-left">
              <div className="text-sm">
                <span className="text-gray-700">PlantIn</span>
                <span className="mx-1 text-gray-700">&gt;</span>
                <span className="text-gray-600">Ask the Botanist</span>
              </div>
            </div>
            <p className="text-3xl text-left md:text-4xl font-bold text-black">
              Ask Experienced Plant Doctor & Get Gardening Consultation
            </p>
            <p className="text-sm text-left">
              Get professional pieces of advice from our Botanists
            </p>
            <button
              type="button"
              className="flex items-center justify-center rounded-[30px] mt-4 w-full md:w-80 px-4 py-3 font-semibold text-white bg-gradient-to-r from-[#04BF94] to-[#52C8AD] shadow-xl hover:shadow-lg hover:from-[#06D3A4] hover:to-[#60E7C8]"
            >
              Ask the Botanist
            </button>
          </div>
          <div className="w-full md:w-1/2 h-64 md:h-auto">
            <img
              src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FAsk_the_bo_89a31442d3.webp%3Fupdated_at%3D2022-09-30T07%3A57%3A55.562Z&w=3840&q=75"
              alt="Ask the Botanist Illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        {/* How It Works Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-left pl-4">How it works</h2>
          <div className="mt-8 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <ul className="space-y-8">
                <li className="flex flex-col items-start">
                  <h3 className="text-lg text-gray-800 font-bold">1. Describe your issue</h3>
                  <p className="mt-2 text-gray-600 text-sm text-left">
                    Fill out a quick form and tell us what you need help with.
                  </p>
                </li>
                <li className="flex flex-col items-start">
                  <h3 className="text-lg text-gray-800 font-bold">2. Get a Botanist assigned</h3>
                  <p className="mt-2 text-gray-600 text-sm text-left">
                    We match your request to the right expert.
                  </p>
                </li>
                <li className="flex flex-col items-start">
                  <h3 className="text-lg text-gray-800 font-bold">3. Receive your answer</h3>
                  <p className="mt-2 text-gray-600 text-sm text-left">
                    Our certified botanists handle your requests 24/7.
                  </p>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex justify-center md:justify-end">
              <img
                src="https://i.ibb.co/gbPGh6bf/Screenshot-9.png"
                alt="How it works illustration"
                className="max-w-full h-auto rounded-lg shadow-md"
              />
            </div>
          </div>
        </section>

        {/* Meet Our Botanists Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center">Meet our botanists</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-4 bg-gray-200 flex justify-center items-center rounded-full overflow-hidden">
                <img
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FTraicee_Lynn_Adams_5c2dd51fc4.webp&w=256&q=75"
                  alt="Traicee Lynn Adams"
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-lg text-gray-800 font-semibold">Traicee Lynn Adams</h3>
              <p className="mt-2 text-center text-gray-600 text-sm">
                Specializes in rare plants and their cultivation.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-4 bg-gray-200 flex justify-center items-center rounded-full overflow-hidden">
                <img
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FA_Smith_01b64dec44.webp&w=256&q=75"
                  alt="A. Smith"
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-lg text-gray-800 font-semibold">A. Smith</h3>
              <p className="mt-2 text-center text-gray-600 text-sm">
                Has worked as an interior plant designer for over 10 years.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 mb-4 bg-gray-200 flex justify-center items-center rounded-full overflow-hidden">
                <img
                  src="https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FColaippe_Lopez_6e5db331ca.webp&w=256&q=75"
                  alt="Cloippe Lopez"
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-lg text-gray-800 font-semibold">Cloippe Lopez</h3>
              <p className="mt-2 text-center text-gray-600 text-sm">
                Can you tell me what's wrong with your plant? I can help you with that.
              </p>
            </div>
          </div>
        </section>

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

        {/* What Our Customers Say Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 text-center">What our customers say</h2>
          <div className="mt-8 grid gap-8 sm:grid-cols-3 relative">
            <div className="flex flex-col items-start p-6 bg-white border rounded-xl shadow-sm">
              <img src='https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fquote_1_af8ca34b93.webp&w=96&q=75' alt="Quote" className="w-8 h-8 mb-2" />
              <p className="text-gray-800 text-sm">
                The experts are amazing! Helped me a bunch of times with my many plants
              </p>
              <p className="mt-4 text-gray-800 font-semibold">Jackson K.</p>
            </div>
            <div className="flex flex-col items-start p-6 bg-white border rounded-xl shadow-sm">
              <img src='https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fquote_1_af8ca34b93.webp&w=96&q=75' alt="Quote" className="w-8 h-8 mb-2" />
              <p className="text-gray-800 text-sm">
                Had something wrong with my plant. They figured out that it had fungus and told me how to treat it.
              </p>
              <p className="mt-4 text-gray-800 font-semibold">pandora</p>
            </div>
            <div className="flex flex-col items-start p-6 bg-white border rounded-xl shadow-sm">
              <img src='https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fquote_1_af8ca34b93.webp&w=96&q=75' alt="Quote" className="w-8 h-8 mb-2" />
              <p className="text-gray-800 text-sm">
                I have like 13 plants and the expert help feature is the most useful to me because I get personalized consultations
              </p>
              <p className="mt-4 text-gray-800 font-semibold">snakeplant</p>
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col space-y-2">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center bg-[#04BF94] rounded-full text-white"
              >
                <span className="text-xl">&gt;</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Ask Us Anything Section - Second Row */}
      <section className="w-full p-6 pl-14 mt-12">
        <div className="text-left">
          <h2 className="text-2xl text-left font-bold text-gray-800">
            Ask us anything
          </h2>
          <p className="text-gray-600 text-left mt-2">
            Learn how to protect your plants from danger.
          </p>
          <button
            type="button"
            className="mt-4 px-5 py-2 bg-teal-500 border border-teal-500 rounded-full hover:bg-teal-800 text-white"
          >
            Ask the Botanist
          </button>
        </div>
      </section>
    </div>
  );
};

export default AskTheBotanist;