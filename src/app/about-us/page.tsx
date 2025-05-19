import React from 'react';

const AboutSection = () => {
  return (
    <section className="bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-4">
          <p className="text-sm text-gray-500">PlantIn &gt; About us</p>
        </div>

        {/* Heading */}
        <h2 className="text-4xl font-bold text-gray-800 mb-6">Welcome to PlantIn</h2>

        {/* Description */}
        <p className="text-lg text-gray-700 mb-4">
          It's your virtual gardening companion. To get humans and nature in touch, we support green
          thumbs with personalized plant care plans. Our custom ML model identifies more than 16,000
          plant species with 95.8% accuracy and dozens of plant diseases.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          For personalized advice, we also offer conversations with botany experts. Every feature of
          PlantIn is created to make your gardening journey comfortable. We aim to build a worldwide
          community of plant enthusiasts who care, share, and learn while practicing.
        </p>

        {/* Educate with Fun */}
        <h3 className="text-3xl font-semibold text-gray-800 mt-8 mb-4">Educate with fun</h3>
        <p className="text-lg text-gray-700 mb-6">
          We believe in the power of edutainment. The more time you spend with PlantIn, the more you
          learn about plants around you. Read articles online & offline, take quizzes to test your
          knowledge, or use real-time scanning to get valuable tips on plant care.
        </p>
        <img
          src="https://strapi.myplantin.com/banner_educate_with_fun_d7e18202c4.webp"
          alt="Educating users with fun features"
          className="w-full rounded-lg shadow-md"
        />

        {/* Care Effortlessly */}
        <h3 className="text-3xl font-semibold text-gray-800 mt-8 mb-4">Care effortlessly</h3>
        <p className="text-lg text-gray-700 mb-6">
          Identify the plant just by scanning it with a smartphone, tablet, or laptop. Enjoy our light
          meter and watering calculator features to create favorable conditions for your green pets.
          Arrange greenery in spaces and get customized disease treatment guides. PlantIn encourages
          practical learning: enjoy the process of improving your planting skills to grow lusher plants!
        </p>
        <img
          src="https://strapi.myplantin.com/banner_care_effortlessly_75159b4a57.webp"
          alt="Care effortlessly with PlantIn"
          className="w-full rounded-lg shadow-md"
        />

        {/* Consult with Experts */}
        <h3 className="text-3xl font-semibold text-gray-800 mt-8 mb-4">Consult with experts</h3>
        <p className="text-lg text-gray-700 mb-6">
          PlantIn provides a personalized experience for everyone interested in planting. All of our
          experts are certified botanists, processing your requests on a 24-hour day. If you face
          difficulties while treating your plants, don't hesitate to use the "Ask The Botanist"
          feature. We value individual approaches and jump for joy when you come back with a request
          again. Also, we collect the most unusual ones — would you be the one-of-a-kind?
        </p>
        <img
          src="https://strapi.myplantin.com/banner_consult_with_experts_b22406db35.webp"
          alt="Consulting with expert botanists"
          className="w-full rounded-lg shadow-md"
        />

        {/* Sustainable Innovation */}
        <h3 className="text-3xl font-semibold text-gray-800 mt-8 mb-4">Sustainable innovation</h3>
        <p className="text-lg text-gray-700 mb-4">
          Our team is aware of the potential threats of climate change and encourages biodiversity
          conservation by all possible means. We believe that to save nature, everyone should get
          started with their own home.
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Not sure where to start? Lean on us and watch your planting journey become effortless yet
          exciting. Using the latest AR technologies and supporting a trend on plant care, we intend
          to assist people from all around the globe to make our planter a better — and greener —
          place to live.
        </p>
        <img
          src="https://strapi.myplantin.com/banner_sustainable_innovation_6a45188d73.webp"
          alt="Sustainable innovation for a greener world"
          className="w-full rounded-lg shadow-md"
        />

        {/* Testimonials */}
        <h3 className="text-3xl font-semibold text-gray-800 mt-8 mb-4">Our testimonials</h3>
        <p className="text-lg text-gray-700 mb-4">
          To see how many of you trust us is our biggest flex. PlantIn is ranked 1st in the App Store
          and Google Play "Education" category. While our most popular markets are the USA,
          Australia, the UK, and Mexico, more than 22 million people use our app every month!
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Still not among those 22 million? We're available on iOS, Android, and Web.
        </p>

        {/* Final Call to Action */}
        <h3 className="text-3xl font-semibold text-gray-800 mt-8 mb-4">Become a plant hero with us</h3>
        <p className="text-lg text-gray-700 mb-6">
          We know plants have feelings, just as people do. In PlantIn, we do our best to respect plants'
          needs and wants.
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Our mission is to bring humans and nature closer together: by enriching your planting experience, inspiring you to gain knowledge, and proving that gardening is simple.
        </p>
        <p className="text-lg text-gray-700 mb-6">
          Not all heroes wear capes. Some of them grow plants! We're looking forward to you becoming a part of the PlantIn family.


        </p>
        <img
          src="https://strapi.myplantin.com/Stat_Brand_About_Us_Blog_v1_1400x720_25043_OV_SS_ec79412b9a.webp"
          alt="Become a plant hero with PlantIn"
          className="w-full rounded-lg shadow-md"
        />
      </div>
    </section>
  );
};

export default AboutSection;
