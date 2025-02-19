const MONGO_URI = "mongodb+srv://LustyCodes:Lusty50861407@srapingdata.oftie.mongodb.net/?retryWrites=true&w=majority&appName=SrapingData"; // MongoDB URI with credentials
const DB_NAME = "AdultEmpire"; // The name of your database
const COLLECTION_NAME = "AdultDB"; // The collection you're working with

// Connect to MongoDB (using MongoDB Atlas connection string)
const { MongoClient } = require('mongodb');
let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client.db(DB_NAME).collection(COLLECTION_NAME);
}

async function handleRequest(request) {
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries()); // Get query params from URL

  const { id } = queryParams; // Extract the 'id' from query params

  if (!id) {
    return new Response("ID parameter is missing", { status: 400 });
  }

  // Remove the 'id' from the query parameters, as we don't need to store it as a key
  delete queryParams.id;

  try {
    const collection = await connectToDatabase();

    // Check if the 'id' already exists in the database
    const existingData = await collection.findOne({ id });

    if (existingData) {
      // If data exists, update the document with the new data
      const updatedData = {
        ...existingData,
        ...queryParams, // Spread the query parameters into the existing document
      };

      await collection.updateOne(
        { id },
        { $set: updatedData }
      );

      return new Response("Data updated successfully", { status: 200 });
    } else {
      // If data doesn't exist, insert new data with all the query params
      const newData = { id, ...queryParams };

      await collection.insertOne(newData);

      return new Response("Data inserted successfully", { status: 201 });
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error); // Log the error for debugging
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});
