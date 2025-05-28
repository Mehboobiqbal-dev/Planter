const { MongoClient } = require('mongodb');
const fs = require('fs'); // Import the file system module
const path = require('path'); // Import the path module

const uri = process.env.MONGODB_URI || 'mongodb+srv://Mehboob090:Mehboob090%40@cluster0.zvqxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

// Load the plant data from your JSON file
// Make sure 'all_plants_data.json' is in the same directory as this script,
// or provide the correct path.
let sourcePlantData = [];
try {
  const filePath = path.join(__dirname, 'all_plants_data.json'); // Assumes JSON is in the same directory
  const jsonData = fs.readFileSync(filePath, 'utf8');
  sourcePlantData = JSON.parse(jsonData);
  console.log(`Successfully loaded ${sourcePlantData.length} plants from JSON file.`);
} catch (error) {
  console.error('Error loading or parsing plant data JSON file:', error);
  process.exit(1); // Exit if data can't be loaded
}


async function insertPlants() {
  if (sourcePlantData.length === 0) {
    console.log("No plant data loaded. Exiting.");
    return;
  }

  try {
    await client.connect();
    console.log("Successfully connected to MongoDB.");
    const db = client.db('plantdb'); // Your database name
    const plantsCollection = db.collection('plants');

    // Optional: Clear existing data. Use with caution.
    // console.log("Clearing existing plants collection...");
    // const deleteResult = await plantsCollection.deleteMany({});
    // console.log(`Cleared ${deleteResult.deletedCount} existing plants.`);

    let insertedCount = 0;
    let skippedCount = 0;

    // --------- OPTION 1: Insert one by one (easier to debug, slower for huge datasets) --------
    console.log(`Starting to insert ${sourcePlantData.length} plants one by one...`);
    for (const currentPlantData of sourcePlantData) {
      if (!currentPlantData || !currentPlantData.name) {
        console.warn('Skipping invalid plant data object:', currentPlantData);
        skippedCount++;
        continue;
      }
      const plantDocument = {
        name: currentPlantData.name,
        latin: currentPlantData.latin,
        category: 'Houseplant', // Use source category or default
        image:
          currentPlantData.images && currentPlantData.images.length > 0 && currentPlantData.images[0].formats?.medium?.url
            ? currentPlantData.images[0].formats.medium.url
            : currentPlantData.images && currentPlantData.images.length > 0 && currentPlantData.images[0].url
            ? currentPlantData.images[0].url
            : 'https://myplantin.com/images/placeholder.jpg',
        description: currentPlantData.invitation || currentPlantData.description || currentPlantData.latin,
        invitation: currentPlantData.invitation,
        fullDescription: currentPlantData.general_information || currentPlantData.fullDescription,
        images: Array.isArray(currentPlantData.images)
          ? currentPlantData.images.map((img) => ({
              id: img.id, // Consider if this ID is necessary or if MongoDB's _id is sufficient
              name: img.name,
              url: img.url,
              formats: img.formats || {}, // Ensure formats exists
              caption: img.caption,
              alternativeText: img.alternativeText,
              width: img.width,
              height: img.height,
            }))
          : [],
        care: {
          water: currentPlantData.water_description || currentPlantData.water,
          sunlight: currentPlantData.sunlight,
          soil: currentPlantData.soil,
          fertilizer: currentPlantData.fertilizer_description || currentPlantData.fertilizer,
          temperature: currentPlantData.temperature,
          pruning: currentPlantData.cut_description || currentPlantData.cutting,
          propagation: currentPlantData.propagation,
          container: currentPlantData.container,
          pests: currentPlantData.pests,
          diseases: currentPlantData.diseases,
        },
        careRequirements: [
          { icon: 'https://strapi.myplantin.com/climate_humidity_3ff8353df1.webp', label: 'Water', value: currentPlantData.water_time || 'Varies' },
          { icon: 'https://strapi.myplantin.com/climate_lightening_full_sun_da7f3a0b51.webp', label: 'Sunlight', value: currentPlantData.light_secondary || 'Indirect' },
          { icon: 'https://strapi.myplantin.com/climate_difficulty_66231487c6.webp', label: 'Humidity', value: currentPlantData.humidity || 'Medium' },
          { icon: 'https://strapi.myplantin.com/climate_difficulty_66231487c6.webp', label: 'Difficulty', value: currentPlantData.difficulty || 'Medium' },
        ],
        careSections: [
          { title: 'Watering', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fplant_care_water_74ea6d9cdc.webp&w=48&q=75', description: currentPlantData.water_description || currentPlantData.water },
          { title: 'Sunlight', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fplant_care_sunlight_30ed9006a6.webp&w=48&q=75', description: currentPlantData.sunlight },
          { title: 'Soil', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FPlanting_icon_2c3ce2a493.webp&w=48&q=75', description: currentPlantData.soil },
          { title: 'Fertilizer', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fplant_care_fertilizer_8feecd00c0.webp&w=48&q=75', description: currentPlantData.fertilizer_description || currentPlantData.fertilizer },
          { title: 'Temperature', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fplant_care_temperature_330abe06c7.webp&w=48&q=75', description: currentPlantData.temperature },
          { title: 'Pruning', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FPlanting_icon_ed780f57c5.webp&w=48&q=75', description: currentPlantData.cut_description || currentPlantData.cutting },
          { title: 'Propagation', icon: 'https://myplantin.com/icons/propagation.svg', description: currentPlantData.propagation },
        ].filter(section => section.description), // Only include sections with a description
        funFact: currentPlantData.fun_fact,
        commonName: currentPlantData.common_name,
        slug: currentPlantData.slug || currentPlantData.name?.toLowerCase().replace(/\s+/g, '-'), // Generate slug if missing
        toxicity: currentPlantData.toxin,
        difficulty: currentPlantData.difficulty,
        humidity: currentPlantData.humidity,
        originalId: currentPlantData.id, // Store original ID if it's useful
        originalCreatedAt: currentPlantData.createdAt ? new Date(currentPlantData.createdAt) : new Date(),
        originalUpdatedAt: currentPlantData.updatedAt ? new Date(currentPlantData.updatedAt) : new Date(),
        originalPublishedAt: currentPlantData.publishedAt ? new Date(currentPlantData.publishedAt) : new Date(),
      };

      try {
        await plantsCollection.insertOne(plantDocument);
        insertedCount++;
        if (insertedCount % 100 === 0) { // Log progress every 100 inserts
            console.log(`Inserted ${insertedCount} plants so far...`);
        }
      } catch (insertError) {
        console.error(`Error inserting plant: ${currentPlantData.name} (Original ID: ${currentPlantData.id})`, insertError);
        // Optionally, you could collect failed inserts to retry later
      }
    }
    console.log('All specified plants processed.');

    // --------- OPTION 2: Insert many in batches (more efficient for very large datasets) --------
    /*
    console.log(`Preparing to insert ${sourcePlantData.length} plants in batches...`);
    const batchSize = 500; // Adjust batch size as needed
    let documentsToInsert = [];
    for (const currentPlantData of sourcePlantData) {
      if (!currentPlantData || !currentPlantData.name) {
        console.warn('Skipping invalid plant data object:', currentPlantData);
        skippedCount++;
        continue;
      }
      const plantDocument = {
        // ... (same plantDocument mapping as above) ...
        name: currentPlantData.name,
        latin: currentPlantData.latin,
        category: currentPlantData.category || 'Houseplant',
        image:
          currentPlantData.images && currentPlantData.images.length > 0 && currentPlantData.images[0].formats?.medium?.url
            ? currentPlantData.images[0].formats.medium.url
            : currentPlantData.images && currentPlantData.images.length > 0 && currentPlantData.images[0].url
            ? currentPlantData.images[0].url
            : 'https://myplantin.com/images/placeholder.jpg',
        description: currentPlantData.invitation || currentPlantData.description || currentPlantData.latin,
        invitation: currentPlantData.invitation,
        fullDescription: currentPlantData.general_information || currentPlantData.fullDescription,
        images: Array.isArray(currentPlantData.images)
          ? currentPlantData.images.map((img) => ({
              id: img.id,
              name: img.name,
              url: img.url,
              formats: img.formats || {},
              caption: img.caption,
              alternativeText: img.alternativeText,
              width: img.width,
              height: img.height,
            }))
          : [],
        care: {
          water: currentPlantData.water_description || currentPlantData.water,
          sunlight: currentPlantData.sunlight,
          soil: currentPlantData.soil,
          fertilizer: currentPlantData.fertilizer_description || currentPlantData.fertilizer,
          temperature: currentPlantData.temperature,
          pruning: currentPlantData.cut_description || currentPlantData.cutting,
          propagation: currentPlantData.propagation,
          container: currentPlantData.container,
          pests: currentPlantData.pests,
          diseases: currentPlantData.diseases,
        },
        careRequirements: [
          { icon: 'https://strapi.myplantin.com/climate_humidity_3ff8353df1.webp', label: 'Water', value: currentPlantData.water_time || 'Varies' },
          { icon: 'https://strapi.myplantin.com/climate_lightening_full_sun_da7f3a0b51.webp', label: 'Sunlight', value: currentPlantData.light_secondary || 'Indirect' },
          { icon: 'https://strapi.myplantin.com/climate_difficulty_66231487c6.webp', label: 'Humidity', value: currentPlantData.humidity || 'Medium' },
          { icon: 'https://strapi.myplantin.com/climate_difficulty_66231487c6.webp', label: 'Difficulty', value: currentPlantData.difficulty || 'Medium' },
        ],
        careSections: [
          { title: 'Watering', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fplant_care_water_74ea6d9cdc.webp&w=48&q=75', description: currentPlantData.water_description || currentPlantData.water },
          { title: 'Sunlight', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fplant_care_sunlight_30ed9006a6.webp&w=48&q=75', description: currentPlantData.sunlight },
          { title: 'Soil', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FPlanting_icon_2c3ce2a493.webp&w=48&q=75', description: currentPlantData.soil },
          { title: 'Fertilizer', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fplant_care_fertilizer_8feecd00c0.webp&w=48&q=75', description: currentPlantData.fertilizer_description || currentPlantData.fertilizer },
          { title: 'Temperature', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2Fplant_care_temperature_330abe06c7.webp&w=48&q=75', description: currentPlantData.temperature },
          { title: 'Pruning', icon: 'https://myplantin.com/_next/image?url=https%3A%2F%2Fstrapi.myplantin.com%2FPlanting_icon_ed780f57c5.webp&w=48&q=75', description: currentPlantData.cut_description || currentPlantData.cutting },
          { title: 'Propagation', icon: 'https://myplantin.com/icons/propagation.svg', description: currentPlantData.propagation },
        ].filter(section => section.description),
        funFact: currentPlantData.fun_fact,
        commonName: currentPlantData.common_name,
        slug: currentPlantData.slug || currentPlantData.name?.toLowerCase().replace(/\s+/g, '-'),
        toxicity: currentPlantData.toxin,
        difficulty: currentPlantData.difficulty,
        humidity: currentPlantData.humidity,
        originalId: currentPlantData.id,
        originalCreatedAt: currentPlantData.createdAt ? new Date(currentPlantData.createdAt) : new Date(),
        originalUpdatedAt: currentPlantData.updatedAt ? new Date(currentPlantData.updatedAt) : new Date(),
        originalPublishedAt: currentPlantData.publishedAt ? new Date(currentPlantData.publishedAt) : new Date(),
      };
      documentsToInsert.push(plantDocument);
      if (documentsToInsert.length >= batchSize) {
        const result = await plantsCollection.insertMany(documentsToInsert);
        insertedCount += result.insertedCount;
        console.log(`Inserted batch of ${result.insertedCount} plants. Total inserted: ${insertedCount}`);
        documentsToInsert = []; // Reset for next batch
      }
    }
    // Insert any remaining documents
    if (documentsToInsert.length > 0) {
      const result = await plantsCollection.insertMany(documentsToInsert);
      insertedCount += result.insertedCount;
      console.log(`Inserted final batch of ${result.insertedCount} plants. Total inserted: ${insertedCount}`);
    }
    */

    console.log(`\n--- Summary ---`);
    console.log(`Successfully inserted ${insertedCount} plants.`);
    if (skippedCount > 0) {
        console.log(`Skipped ${skippedCount} invalid plant data objects.`);
    }
    console.log('----------------');

  } catch (error) {
    console.error('Error during plant insertion process:', error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed.");
  }
}

insertPlants();