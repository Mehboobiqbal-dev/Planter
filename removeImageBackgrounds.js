const { MongoClient } = require("mongodb");
const fs = require("fs/promises");
const path = require("path");
const sharp = require("sharp");

async function removeBackgroundAndUpdateImages() {
  // 1) Connect to MongoDB
  const uri = "mongodb+srv://Mehboob090:Mehboob090%40@cluster0.zvqxj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("plantdb");
    const categoryCollection = database.collection("categories");

    // 2) Fetch all categories
    const categories = await categoryCollection.find({}).toArray();

    // 3) Define assets directory
    const assetsDir = path.join(process.cwd(), "public", "assets", "category-images");
    const outputDir = path.join(process.cwd(), "public", "assets", "category-images-no-bg");
    await fs.mkdir(outputDir, { recursive: true });

    // 4) Process each category
    for (const category of categories) {
      const headerImagePath = category.headerImage;

      // Skip if headerImage is empty or not a local path
      if (!headerImagePath || !headerImagePath.startsWith("/assets/category-images")) {
        console.log(`Skipping category ${category.name}: No valid local image path`);
        continue;
      }

      try {
        // 5) Construct full file path
        const fileName = path.basename(headerImagePath);
        const inputFilePath = path.join(assetsDir, fileName);
        const outputFileName = `no-bg-${fileName.replace(/\.[^/.]+$/, "")}.png`; // Convert to PNG for transparency
        const outputFilePath = path.join(outputDir, outputFileName);
        const relativeOutputPath = `/assets/category-images-no-bg/${outputFileName}`;

        // 6) Check if input file exists
        try {
          await fs.access(inputFilePath);
        } catch {
          console.log(`Skipping category ${category.name}: Image file ${inputFilePath} not found`);
          continue;
        }

        // 7) Remove black background using sharp
        await sharp(inputFilePath)
          .ensureAlpha() // Ensure image has an alpha channel
          .raw()
          .toBuffer({ resolveWithObject: true })
          .then(({ data, info }) => {
            // Process pixels to make black (RGB 0,0,0) transparent
            for (let i = 0; i < data.length; i += info.channels) {
              if (data[i] === 0 && data[i + 1] === 0 && data[i + 2] === 0) {
                data[i + 3] = 0; // Set alpha to 0 (transparent) for black pixels
              }
            }
            return sharp(data, {
              raw: {
                width: info.width,
                height: info.height,
                channels: info.channels,
              },
            })
              .png() // Save as PNG to preserve transparency
              .toFile(outputFilePath);
          });

        console.log(`Removed background for ${category.name}, saved to ${outputFilePath}`);

        // 8) Update MongoDB with new image path
        await categoryCollection.updateOne(
          { _id: category._id },
          { $set: { headerImage: relativeOutputPath } }
        );
        console.log(`Updated headerImage path for ${category.name} to ${relativeOutputPath}`);
      } catch (error) {
        console.error(`Error processing image for ${category.name}:`, error);
      }
    }

    console.log("Background removal and database update completed");
  } catch (error) {
    console.error("Error connecting to MongoDB or processing images:", error);
    throw error;
  } finally {
    await client.close();
  }
}

// Execute the function
removeBackgroundAndUpdateImages().catch((error) => {
  console.error("Script execution failed:", error);
  process.exit(1);
});