const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../client')));
app.use('/api', require('./routes/api'));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
