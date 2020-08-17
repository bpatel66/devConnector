// we import express to allow us to build out the middleware of our applcation
const express = require('express');
// import our database file to connect our database when the applcation starts
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// initialize middleware
app.use(
  express.json({
    extended: false,
  })
);

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server has started on port: ${PORT}`));
