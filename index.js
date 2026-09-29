require('dotenv').config();
const express = require('express');
const app = express();

const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send("JUNIOR SCHOLARS SERVER is running")
})

app.listen(PORT, () => {
  console.log(`JUNIOR SCHOLARS is running on port ${PORT}`);
})