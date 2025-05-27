const { MongoClient } = require('mongodb');

// Replace with your MongoDB URI
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/plantdb';
const client = new MongoClient(uri);

// Your Begonia JSON data
const plantData = {
  id: 49,
  name: "Begonia",
  latin: "Begonia",
  invitation: "Begonia belongs to the genus Begoniaceae, including about 1600 species...",
  general_information: "Begonia was first described in the 17th century during an expedition to the Antilles...",
  visible: true,
  section: null,
  fun_fact: "Begonia is not only beautiful but also beneficial...",
  slug: "begonia",
  common_name: "",
  container: "For begonias, you should choose an average ceramic pot 3-4 cm larger than the root system...",
  water: "Begonia loves moisture but does not tolerate waterlogging...",
  soil: "The soil for the plant can be purchased at the store or prepared by yourself...",
  fertilizer: "Begonia must be fertilized, especially during the period of growth and flowering...",
  temperature: "Ideal conditions for Begonias in summer +20-22°C (68-72 Fº)...",
  cutting: "If the plant has lost its decorative shape, then cut 4-5 cm along the edge of the pot...",
  propagation: "Begonia can be propagated by seeds or vegetatively...",
  else: "",
  rid_off: "",
  water_count: 2,
  water_time: "1/week",
  water_description: "Striking the right balance with watering is the biggest challenge...",
  cut: 5,
  cut_description: "Immediately remove any dead leaves, stems, and flowers...",
  zone_max: null,
  zone_min: "10b",
  koppen: null,
  summer_max: 25,
  summer_min: 18,
  winter_max: 25,
  winter_min: 18,
  min_temp: 2,
  light_secondary: "shade",
  humidity: "normal",
  commitment: "normal",
  difficulty: "medium",
  dormancy: "coldPeriod",
  poison_type: null,
  evergreen: true,
  createdAt: "2022-01-20T14:52:02.000Z",
  updatedAt: "2022-12-27T14:10:11.084Z",
  publishedAt: "2022-01-20T14:52:02.000Z",
  sunlight: "Home-grown Begonia requires constancy...",
  fertilizer_description: "Applying a liquid houseplant fertilizer according to the package instructions...",
  fertilizer_count: 3,
  fertilizer_time: "1/month",
  cut_time: "1/month",
  pests: "",
  diseases: "",
  botanists_tips: "",
  faq_ld: null,
  need_translate: null,
  need_update_index: null,
  weed_invasive: false,
  reproduction: "",
  impacts: "",
  habitat: "",
  identification: "",
  default_care_tips_category: null,
  toxin: "Calcium oxalate",
  origin: null,
  noxious_weed_areas: null,
  other_names: null,
  views: 10,
  care_guide: null,
  translated: null,
  images: [
    {
      id: 74960,
      name: "begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
      alternativeText: "Hanging Begonia",
      caption: "begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
      width: 5093,
      height: 3398,
      formats: {
        large: {
          ext: ".webp",
          url: "https://strapi.myplantin.com/large_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          hash: "large_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182",
          mime: "image/webp",
          name: "large_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          path: null,
          size: 99.26,
          width: 1000,
          height: 667,
          caption: "large_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          alternative_text: "large_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp"
        },
        small: {
          ext: ".webp",
          url: "https://strapi.myplantin.com/small_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          hash: "small_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182",
          mime: "image/webp",
          name: "small_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          path: null,
          size: 36.44,
          width: 500,
          height: 333,
          caption: "small_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          alternative_text: "small_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp"
        },
        medium: {
          ext: ".webp",
          url: "https://strapi.myplantin.com/medium_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          hash: "medium_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182",
          mime: "image/webp",
          name: "medium_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          path: null,
          size: 66.01,
          width: 750,
          height: 500,
          caption: "medium_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          alternative_text: "medium_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp"
        },
        thumbnail: {
          ext: ".webp",
          url: "https://strapi.myplantin.com/thumbnail_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          hash: "thumbnail_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182",
          mime: "image/webp",
          name: "thumbnail_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          path: null,
          size: 11.93,
          width: 234,
          height: 156,
          caption: "thumbnail_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
          alternative_text: "thumbnail_begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp"
        }
      },
      hash: "begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182",
      ext: ".webp",
      mime: "image/webp",
      size: 654.21,
      url: "https://strapi.myplantin.com/begonia_plant_with_beautiful_big_yellow_flowers_2022_06_03_16_20_40_utc_min_a433e06182.webp",
      previewUrl: null,
      provider: "strapi-provider-upload-s3-cdn",
      provider_metadata: null,
      createdAt: "2022-12-27T14:10:08.734Z",
      updatedAt: "2022-12-27T14:10:08.734Z",
      folderPath: "/"
    }
  ]
};

async function insertPlants() {
  try {
    await client.connect();
    const db = client.db('plantdb');
    const plantsCollection = db.collection('plantsq');

    // Clear existing data (optional, remove if appending)
    await plantsCollection.deleteMany({});

    // Prepare plant document
    const plant = {
      name: plantData.name,
      latin: plantData.latin,
      category: plantData.default_care_tips_category || 'indoor', // Default to 'indoor'
      image: plantData.images[0]?.formats?.medium?.url || plantData.images[0]?.url || 'https://myplantin.com/images/placeholder.jpg', // Use medium format or fallback
      description: plantData.latin, // Use latin name as short description
      invitation: plantData.invitation,
      fullDescription: plantData.general_information,
      images: plantData.images.map((img) => ({
        id: img.id,
        name: img.name,
        url: img.url,
        formats: img.formats,
        caption: img.caption,
        alternativeText: img.alternativeText,
        width: img.width,
        height: img.height,
      })),
      care: {
        water: plantData.water_description || plantData.water,
        sunlight: plantData.sunlight,
        soil: plantData.soil,
        fertilizer: plantData.fertilizer_description || plantData.fertilizer,
        temperature: plantData.temperature,
        pruning: plantData.cut_description || plantData.cutting,
        propagation: plantData.propagation,
        container: plantData.container,
        pests: plantData.pests,
        diseases: plantData.diseases,
      },
      careRequirements: [
        {
          icon: 'https://myplantin.com/icons/water.svg', // Replace with actual icon URL
          label: 'Water',
          value: plantData.water_time || 'Unknown',
        },
        {
          icon: 'https://myplantin.com/icons/sunlight.svg',
          label: 'Sunlight',
          value: plantData.light_secondary || 'Indirect',
        },
        {
          icon: 'https://myplantin.com/icons/humidity.svg',
          label: 'Humidity',
          value: plantData.humidity || 'Normal',
        },
        {
          icon: 'https://myplantin.com/icons/difficulty.svg',
          label: 'Difficulty',
          value: plantData.difficulty || 'Unknown',
        },
      ],
      careSections: [
        {
          title: 'Watering',
          icon: 'https://myplantin.com/icons/water.svg',
          description: plantData.water_description || plantData.water,
        },
        {
          title: 'Sunlight',
          icon: 'https://myplantin.com/icons/sunlight.svg',
          description: plantData.sunlight,
        },
        {
          title: 'Soil',
          icon: 'https://myplantin.com/icons/soil.svg',
          description: plantData.soil,
        },
        {
          title: 'Fertilizer',
          icon: 'https://myplantin.com/icons/fertilizer.svg',
          description: plantData.fertilizer_description || plantData.fertilizer,
        },
        {
          title: 'Temperature',
          icon: 'https://myplantin.com/icons/temperature.svg',
          description: plantData.temperature,
        },
        {
          title: 'Pruning',
          icon: 'https://myplantin.com/icons/pruning.svg',
          description: plantData.cut_description || plantData.cutting,
        },
        {
          title: 'Propagation',
          icon: 'https://myplantin.com/icons/propagation.svg',
          description: plantData.propagation,
        },
      ],
      funFact: plantData.fun_fact,
      commonName: plantData.common_name,
      slug: plantData.slug,
      toxicity: plantData.toxin,
      difficulty: plantData.difficulty,
      humidity: plantData.humidity,
    };

    // Insert into plants collection
    await plantsCollection.insertOne(plant);
    console.log(`Inserted plant: ${plantData.name}`);

    console.log('Plant inserted successfully!');
  } catch (error) {
    console.error('Error inserting plant:', error);
  } finally {
    await client.close();
  }
}

insertPlants();