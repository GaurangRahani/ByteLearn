const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./db/connection');

//load env vars
dotenv.config();

//connection
connectDB();

const app = express();

//Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

//Health Check
app.get('/', (req, res) => {
    res.json({ message: 'ByteLearn API is running...' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
