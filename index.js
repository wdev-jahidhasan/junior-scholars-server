const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8000;

const client = new MongoClient(process.env.MONGODB_URI);

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

connectToMongoDB();

const db = client.db("junior-scholars");
const userCollection = db.collection("user");

app.get('/', (req, res) => {
  res.send("JUNIOR SCHOLARS SERVER is running");
});

// profile update api
app.patch('/api/users/update-profile/:email', async (req, res) => {
  const email = req.params.email;
  const { name, image, studentInfo } = req.body;

  const filter = { email: email };

  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (image !== undefined) updateFields.image = image;
  if (studentInfo !== undefined) updateFields.studentInfo = studentInfo;

  const updateDoc = {
    $set: updateFields,
  };

  const result = await userCollection.updateOne(filter, updateDoc);

  if (result.modifiedCount > 0 || result.matchedCount > 0) {
    res.send({ success: true, message: "Profile updated successfully!" });
  } else {
    res.status(404).send({ success: false, message: "User not found." });
  }
});

app.listen(PORT, () => {
  console.log(`JUNIOR SCHOLARS is running on port ${PORT}`);
});