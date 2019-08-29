'use strict'

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();


app.use(bodyParser.json());

const router = express.Router();

const userRoute = require('./routes/userRoute');
const imgUserRoute = require('./routes/imgUserRoute');
var chatRoute = require('./routes/chatRoute');
app.use(cors({
    "origin": "*",
    "methods": "POST,GET,HEAD,PUT,PATCH,DELETE"
  }));
app.use('/user', userRoute);
app.use('/imgUser', imgUserRoute);
app.use('/chat', chatRoute);

module.exports = app;