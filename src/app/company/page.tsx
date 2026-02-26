import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome to Elch */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Welcome to Elch</h2>
          <p className="text-lg text-gray-700 text-center">
            It's your virtual gardening companion. To get humans and nature in touch, we support green thumbs with personalized plant care plans. Our custom ML model identifies more than 16,000 plant species with 95.8% accuracy and dozens of plant diseases. For personalized advice, we also offer conversations with botany experts. Every feature of Elch is created to make your gardening journey comfortable. We aim to build a worldwide community of plant enthusiasts who care, share, and learn while practicing.
          </p>
        </section>

        {/* Educate with fun */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Educate with fun</h2>
          <p className="text-lg text-gray-700 text-center">
            We believe in the power of edutainment. The more time you spend with Elch, the more you learn about plants around you. Read articles online & offline, take quizzes to test your knowledge, or use real-time scanning to get valuable tips on plant care.
          </p>
        </section>

        {/* Care effortlessly */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Care effortlessly</h2>
          <p className="text-lg text-gray-700 text-center">
            Identify the plant just by scanning it with a smartphone, tablet, or laptop. Enjoy our light meter and watering calculator features to create favorable conditions for your green pets. Arrange greenery in spaces and get customized disease treatment guides. Elch encourages practical learning: enjoy the process of improving your planting skills to grow lusher plants!
          </p>
        </section>

        {/* Consult with experts */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Consult with experts</h2>
          <p className="text-lg text-gray-700 text-center">
            Elch provides a personalized experience for everyone interested in planting. All of our experts are certified botanists, processing your requests on a 24-hour day. If you face difficulties while treating your plants, don't hesitate to use the "Ask The Botanist" feature. We value individual approaches and jump for joy when you come back with a request again. Also, we collect the most unusual ones - would you be the one-of-a-kind?
          </p>
        </section>

        {/* Sustainable innovation */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Sustainable innovation</h2>
          <p className="text-lg text-gray-700 text-center">
            Our team is aware of the potential threats of climate change and encourages biodiversity conservation by all possible means. We believe that to save nature, everyone should get started with their own home. Not sure where to start? Lean on us and watch your planting journey become effortless yet exciting. Using the latest AR technologies and supporting a trend on plant care, we intend to assist people from all around the globe to make our planet a better - and greener - place to live.
          </p>
        </section>

        {/* Our testimonials */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Our testimonials</h2>
          <p className="text-lg text-gray-700 text-center">
            To see how many of you trust us is our biggest flex. Elch is ranked 1st in the App Store and Google Play "Education" category. While our most popular markets are the USA, Australia, the UK, and Mexico, more than 22 million people use our app every month! Still not among those 22 million? We're available on iOS, Android, and Web.
          </p>
        </section>

        {/* Become a plant hero */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-6">Become a plant hero with us</h2>
          <p className="text-lg text-gray-700 text-center">
            We know plants have feelings, just as people do. In Elch, we do our best to respect plants' needs and wants. Our mission is to bring humans and nature closer together: by enriching your planting experience, inspiring you to gain knowledge, and proving that gardening is simple. Not all heroes wear capes. Some of them grow plants! We're looking forward to you becoming a part of the Elch family.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;