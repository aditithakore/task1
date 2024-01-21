const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const UserSchema = require('./UserSchema');
const app = express();
const port = 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/NodejsApis');

mongoose.connection.on('open', () => {
    console.log('Connected to MongoDB successfully');
});

mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use('/user',require('./Endpoint'));


