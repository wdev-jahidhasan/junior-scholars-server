const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
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
const noticesCollection = db.collection("notices");

app.get('/', (req, res) => {
  res.send("JUNIOR SCHOLARS SERVER is running");
});

// get all users from db
app.get('/api/users', async (req, res) => {
  const users = await userCollection.find({}).sort({ _id: -1 }).toArray();
  res.send({ success: true, users });
});

// Profile Update API
app.patch('/api/users/update-profile/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const { name, image, profile } = req.body;

    const filter = { email: email };

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (image !== undefined) updateFields.image = image;
    if (profile !== undefined) updateFields.profile = profile;

    updateFields.updatedAt = new Date();

    const updateDoc = {
      $set: updateFields,
    };

    const result = await userCollection.updateOne(filter, updateDoc);

    if (result.matchedCount > 0) {
      res.send({ success: true, message: "Profile updated successfully!" });
    } else {
      res.status(404).send({ success: false, message: "User not found." });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).send({ success: false, message: "Internal server error." });
  }
});

// user profile details
app.get('/api/users/profile/:email', async (req, res) => {
  const email = req.params.email;
  const query = { email: email };
  const user = await userCollection.findOne(query);

  if (user) {
    res.send({ success: true, user });
  } else {
    res.status(404).send({ success: false, message: "User not found." });
  }
});

// publish notices 
app.post('/api/publish-notice', async (req, res) => {
  const { title, category, audience, publishDate, description } = req.body;

  const newNotice = {
    title,
    category,
    audience,
    date: publishDate,
    description,
    createdAt: new Date(),
  };

  const result = await noticesCollection.insertOne(newNotice);
  res.send({ success: true, message: "Notice published successfully!", insertedId: result.insertedId });
});

// get all notices
app.get('/api/notices', async (req, res) => {
  const notices = await noticesCollection.find({}).sort({ createdAt: -1 }).toArray();
  res.send({ success: true, notices });
});

// update user role
app.patch('/api/users/:id/role', async (req, res) => {
  const id = req.params.id;
  const { role } = req.body;

  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: role,
      updatedAt: new Date()
    }
  };

  const result = await userCollection.updateOne(filter, updateDoc);

  if (result.matchedCount > 0) {
    res.send({ success: true, message: "Role updated successfully!" });
  } else {
    res.status(404).send({ success: false, message: "User not found." });
  }
});

// update user status
app.patch('/api/users/:id/status', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      status: status,
      updatedAt: new Date()
    }
  };

  const result = await userCollection.updateOne(filter, updateDoc);

  if (result.matchedCount > 0) {
    res.send({ success: true, message: "Status updated successfully!" });
  } else {
    res.status(404).send({ success: false, message: "User not found." });
  }
});

app.listen(PORT, () => {
  console.log(`JUNIOR SCHOLARS is running on port ${PORT}`);
});