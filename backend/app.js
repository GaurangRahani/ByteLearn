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

// Routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
