const mongoose = require("mongoose");

mongoose
.connect('mongodb+srv://baccouchioussema:oussema2002@oussema.vjip9cn.mongodb.net/test',)

.then(()=> console.log("Connected to MongoDB"))
.catch((err) =>console.log("Failed to connect to MongoBD , err"));