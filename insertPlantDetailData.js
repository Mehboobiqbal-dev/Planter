const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function insertPlantDetailData() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in .env.local');
  }
  const client = new MongoClient(uri);

  const plantDetails = [
    {
      "data": [
        {
            "id": 1,
            "name": "Chinese Money Plant",
            "latin": "Pilea peperomioides",
            "invitation": "Chinese money plant is an adorable addition to any interior with its unusual round leaves.",
            "general_information": "The natural habitat of this plant is exclusively found in China, in the southwestern province of Sichuan and the western province of Yunnan. It thrives in woods at elevations ranging from 5000-1000ft (1500 to 3000m) on shaded, wet rocks. It is kept as a garden plant in China and as a houseplant all around the world.\n\nPilea Peperomioides has round, glossy, leathery, vivid green leaves with a diameter of up to 10 cm. At first, the bush looks quite inconspicuous, forming a small loose rosette consisting of several leaves on long and slender legs. However, over time, its main stem is pulled up and requires support. The plant develops a trunk throughout time, which is covered with leaves from bottom to top with good care. The plant grows quickly, frequently halting when it reaches 30-35 cm in height.\n\nThe flowering of Pilea Peperomioides is inconspicuous: small, unisexual, collected in inflorescence brushes located in the axils of the leaves, the flowers of the plants are almost imperceptible.",
            "visible": true,
            "section": null,
            "fun_fact": "Its common names, Chinese Money Plant or Japanese Dollar, come from the look of the leaf, which resembles a coin. \"Pancake\" is another common name for this plant.\n\nThe Royal Horticultural Society has given this plant the Award of Garden Merit.",
            "slug": "pilea-peperomioides",
            "common_name": "UFO plant, Japanese Dollar",
            "container": "To prevent the spread of harmful illnesses like root rot, place a drainage cushion consisting of expanded clay, brick chips, or tiny pebbles at the bottom of the container. This may also be done using ceramic shards.  \nBecause Pilea peperomia's root structure is compact and relatively flat, a broad and shallow planter should be used as a flowerpot.",
            "water": "Do not overwater the substrate; the soil should always be slightly moist. Because of soil waterlogging, especially in the winter, the leaves may wither and turn pale.",
            "soil": "Pilea peperomia grows well in light humus soil that is slightly acidic or neutral in reaction. Almost any store-bought, well-draining soil will do, especially those peat-based ones.",
            "fertilizer": "As a fast-growing plant, nutrient compositions must be applied on a regular basis to ensure Pilea’s development. You can use fertilizers of a complicated character (universal) or those designated for ornamental and deciduous plants.",
            "temperature": "The best temperature for Pilea peperomia is 61-77˚F (16-25°C). However, it can endure a substantial decrease in temperature to 32˚F (0˚C) degrees if the soil is kept dry. Drafts during winter are also quite dangerous.",
            "cutting": "Because young specimens are more attractive, you can prune plants once a year and take cuttings from cut branches. In addition, the shoots of plants are trimmed from time to time to reduce exposure and enhance their beauty.",
            "propagation": "Pilea peperomia may be reproduced from seeds as well as cuttings. The most important aspect of developing an attractive plant is to follow specific guidelines and timelines.",
            "else": "To keep your Chinese money plant nicely shaped, rotate it from time to time.",
            "rid_off": "",
            "water_count": 1,
            "water_time": "1/week",
            "water_description": "Allow the soil to dry between waterings, as Pilea do not like soggy soil. Watch the leaves—when they start looking a tad droopy, it’s time to water your plant. In warmer weather, they need to be watered more frequently.",
            "cut": null,
            "cut_description": "You can prune plants once a year and take cuttings from cut branches.",
            "zone_max": "11b",
            "locale": "en",
            "zone_min": "9b",
            "koppen": null,
            "summer_max": 25,
            "summer_min": 18,
            "winter_max": 24,
            "winter_min": 16,
            "min_temp": -4,
            "light_secondary": "shade",
            "humidity": "normal",
            "commitment": "normal",
            "difficulty": "easy",
            "dormancy": "coldPeriod",
            "poison_type": null,
            "evergreen": true,
            "createdAt": "2022-01-20T14:52:02.000Z",
            "updatedAt": "2023-11-01T13:49:34.370Z",
            "publishedAt": "2022-01-20T14:52:02.000Z",
            "sunlight": "Pilea Peperomioides should be kept out of direct sunlight since it is keen to get burns on the leaf plates in the shape of brown or reddish patches. Windows facing east or west are ideal for placement. For windows with a southern direction, it is recommended to create diffused light (you can use translucent fabric, paper, or just curtains).",
            "fertilizer_description": "",
            "fertilizer_count": 1,
            "fertilizer_time": "1/month",
            "cut_time": null,
            "pests": "",
            "diseases": "",
            "botanists_tips": "",
            "faq_ld": null,
            "need_translate": false,
            "need_update_index": true,
            "weed_invasive": false,
            "reproduction": "",
            "impacts": "",
            "habitat": "",
            "identification": "",
            "default_care_tips_category": "indoor",
            "toxin": null,
            "origin": null,
            "noxious_weed_areas": null,
            "other_names": "Ufo Plant, Pancake Plant or Missionary Plant",
            "views": 334,
            "care_guide": null,
            "translated": null
        },
      ],
    },
  ];

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('plantdb');
    const collection = database.collection('plantDetails');

    for (const detail of plantDetails) {
      // Check if detail already exists by _id
      const existingDetail = await collection.findOne({ _id: detail._id });
      if (existingDetail) {
        console.log(`Plant detail '${detail.scientificName}' already exists, skipping...`);
        continue;
      }

      // Insert plant detail
      await collection.insertOne(detail);
      console.log(`Inserted plant detail: ${detail.scientificName}`);
    }

    console.log('All plant details inserted successfully!');
  } catch (error) {
    console.error('Error inserting plant details:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

insertPlantDetailData().catch(console.error);