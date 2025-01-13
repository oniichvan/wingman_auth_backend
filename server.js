const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON payloads

// Routes
app.use('/api/auth', userRoutes);

app.get('/', (req, res) => {
    res.status(200).send('Welcome to the root URL of the server');
});

app.listen(PORT, (err) => {
    if (!err) {
        console.log(`Server is running on http://localhost:${PORT}`);
    } else {
        console.error('Error occurred: server cannot connect', err);
    }
});

// Connect to the database
connectDB();
