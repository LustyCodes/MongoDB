const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

const MONGO_URI = "mongodb+srv://LustyCodes:Lusty50861407@srapingdata.oftie.mongodb.net/?retryWrites=true&w=majority&appName=SrapingData"; // MongoDB URI with credentials
const DB_NAME = "AdultDB"; // The name of your database
const COLLECTION_NAME = "AdultEmpire"; // The collection you're working with

let client;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGO_URI);
    await client.connect();
  }
  return client.db(DB_NAME).collection(COLLECTION_NAME);
}

async function handleRequest(req, res) {
  const queryParams = req.query; // Get query params from URL
  const { id } = queryParams; // Extract the 'id' from query params

  if (!id) {
    return res.status(400).send("ID parameter is missing");
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

      return res.status(200).send("Data updated successfully");
    } else {
      // If data doesn't exist, insert new data with all the query params
      const newData = { id, ...queryParams };

      await collection.insertOne(newData);

      return res.status(201).send("Data inserted successfully");
    }
  } catch (error) {
    console.error('Error connecting to MongoDB:', error); // Log the error for debugging
    return res.status(500).send(`Error: ${error.message}`);
  }
}

// Setup Express route to handle requests
app.get('/', handleRequest);

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

