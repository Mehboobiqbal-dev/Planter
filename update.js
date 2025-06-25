const { MongoClient } = require('mongodb');

// Define constants
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://Mehboob090:Mehboob090%40@cluster0-shard-00-00.zvqxj.mongodb.net:27017,cluster0-shard-00-01.zvqxj.mongodb.net:27017,cluster0-shard-00-02.zvqxj.mongodb.net:27017/?ssl=true&replicaSet=atlas-j8z11a-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';
const DATABASE_NAME = 'plantdb';
const COLLECTION_NAME = 'plants';

// Function to update path by removing 'public/' and ensuring '/assets/'
function updateImagePath(pathStr) {
    if (typeof pathStr !== 'string') return pathStr;
    // Remove 'public/' if present and ensure '/assets/' at the start
    let updatedPath = pathStr.replace(/^\/?public\//, '').replace(/^\/?assets\//, '/assets/');
    // If the path doesn't start with '/assets/', add it
    if (!updatedPath.startsWith('/assets/')) {
        updatedPath = `/assets/${updatedPath.replace(/^\/+/, '')}`;
    }
    // Remove any trailing slashes
    return updatedPath.replace(/\/$/, '');
}

// Main function to update mushroom image paths
async function updateMushroomImagePaths() {
    let client;

    try {
        // Connect to MongoDB
        client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Connected to MongoDB');

        const db = client.db(DATABASE_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // Find all plants with category 'Mushrooms'
        const mushrooms = await collection.find({ category: 'Mushrooms' }).toArray();
        console.log(`Found ${mushrooms.length} mushroom plants`);

        let updatedCount = 0;
        let errorCount = 0;

        // Process each mushroom plant
        for (const plant of mushrooms) {
            try {
                const plantId = plant._id;
                let updateNeeded = false;

                // Process the main 'image' field
                let newImagePath = plant.image;
                if (plant.image && typeof plant.image === 'string') {
                    newImagePath = updateImagePath(plant.image);
                    if (newImagePath !== plant.image) {
                        updateNeeded = true;
                        console.log(`Updated main image path for _id ${plantId}: ${plant.image} -> ${newImagePath}`);
                    }
                }

                // Process the 'images' array
                const updatedImages = [];
                if (Array.isArray(plant.images)) {
                    for (const imageObj of plant.images) {
                        if (imageObj.url && typeof imageObj.url === 'string') {
                            const newUrl = updateImagePath(imageObj.url);
                            if (newUrl !== imageObj.url) {
                                updatedImages.push({ ...imageObj, url: newUrl });
                                updateNeeded = true;
                                console.log(`Updated array image path for _id ${plantId}: ${imageObj.url} -> ${newUrl}`);
                            } else {
                                updatedImages.push(imageObj);
                            }
                        } else {
                            updatedImages.push(imageObj); // Keep original if no valid URL
                        }
                    }
                }

                // Update the document in MongoDB if changes were made
                if (updateNeeded) {
                    await collection.updateOne(
                        { _id: plantId },
                        { $set: { image: newImagePath, images: updatedImages } }
                    );
                    console.log(`Updated plant _id: ${plantId} with new image paths`);
                    updatedCount++;
                } else {
                    console.log(`No updates needed for plant _id: ${plantId}`);
                }

            } catch (error) {
                console.error(`Error processing plant _id: ${plant._id}:`, error);
                errorCount++;
                continue;
            }
        }

        // Summary
        console.log('\nProcessing Summary:');
        console.log(`Total mushroom plants processed: ${mushrooms.length}`);
        console.log(`Successfully updated: ${updatedCount}`);
        console.log(`Errors encountered: ${errorCount}`);

    } catch (error) {
        console.error('Error in updateMushroomImagePaths:', error);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('MongoDB connection closed');
        }
    }
}

// Run the script
(async () => {
    await updateMushroomImagePaths();
})();