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

// Student info update API Route
app.patch('/api/users/student-info/:email', async (req, res) => {
  const email = req.params.email;
  const studentData = req.body;

  const filter = { email: email };
  const updateDoc = {
    $set: {
      studentInfo: studentData
    },
  };

  const result = await userCollection.updateOne(filter, updateDoc);
  res.send();
});

app.listen(PORT, () => {
  console.log(`JUNIOR SCHOLARS is running on port ${PORT}`);
});