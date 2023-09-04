const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());

//Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//wallet API
app.use('/api/v1/wallet', require('./routes/api/wallet'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});