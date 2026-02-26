import Image from "next/image";

const MushroomID = () => {
  return (
    <main>
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-center px-4 py-8 mx-auto max-w-[1320px] gap-8">
        <div className="flex-1 p-6">
          <h1 className="text-4xl font-bold mb-4 text-left">
            Planter Mushroom Identification App Feature
          </h1>
          <p className="text-lg mb-6 text-left">
            Want to go mushroom hunting but not sure which mushrooms you should pick? Don't worry! PlantIn has a mushroom identification app feature designed to make your shroom foraging trip safe and fun!
          </p>
          <div className="flex mt-6">
            <a
              href="https://apps.apple.com/us/app/plantin-plant-identifier-care/id1527399597"
              className="mb-2"
            >
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="Download on the App Store"
                className="h-10"
              />
            </a>
            <a href="https://play.google.com/store/apps/details?id=com.plantin.app">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                className="h-10"
              />
            </a>
          </div>
        </div>
        <div className="flex-1 flex justify-center md:justify-end">
          <Image
            src="https://myplantin.com/_next/image?url=%2Fimages%2Fmushroom-id-app-1.png&w=1080&q=100"
            alt="Boost Plant Growth"
            width={600}
            height={400}
            className="w-full max-w-[600px] h-auto object-cover rounded-lg"
            priority
          />
        </div>
      </section>

      {/* Promotional Section */}
      <section className="flex flex-col items-center justify-center px-4 py-8 mx-auto max-w-[1320px] gap-8">
        <h2 className="text-3xl font-bold mb-4 text-center">
          Why Choose Our Mushroom Identifier App
        </h2>
        <p className="text-lg mb-6 text-center">
          Discover the fascinating world of mushrooms with PlantIn’s mushroom finder feature. The benefits don’t stop!
        </p>
        <ul className="mx-auto xl:max-w-[1230px] lg:max-w-[1100px] max-w-[960px] flex flex-wrap flex-row items-stretch justify-center m-[-6px] mt-[40px]">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <li className="p-[6px] lg:w-[29%] md:w-[45%] w-[100%]">
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-md">
                <div className="mb-4">
                  <img
                    src="https://myplantin.com/icons/mushroom-id-icon-1.svg"
                    alt="Search Icon"
                    className="h-10"
                  />
                </div>
                <p className="text-lg text-center">
                  Fast and accurate recognition of common and rare mushrooms and fungi.
                </p>

              </div>
            </li>
            <li className="p-[6px] lg:w-[29%] md:w-[45%] w-[100%]">
              <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-md">
                <div className="mb-4">
                  <img
                    src="https://myplantin.com/icons/mushroom-id-icon-2.svg"
                    alt="Mushroom Icon"
                    className="h-10"
                  />
                </div>
                <p className="text-lg text-center">
                  All the info on each mushroom you'll ever need: name, habitat, identification help, toxicity, measurements, uses, and so much more in one mushroom identifying app.
                </p>
              </div>
            </li>
          </div>

        </ul>
      </section>
    </main>
  );
};

export default MushroomID;
