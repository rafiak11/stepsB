// const express = require('express') 
// const bodyParser = require('body-parser');
// const contactRoutes = require('./routes/contactRoutes');
// const cors= require('cors')
// const {connect}= require('mongoose');
// require('dotenv').config() 
// const upload = require('express-fileupload')


// const userRoutes = require('./routes/userRoutes')
// const postRoutes = require('./routes/postRoutes')
// const {notFound, errorHandler} = require('./middleware/errorMiddleware')

// const app=express(); 
// app.use(express.json({extended: true}))
// app.use(express.urlencoded({extended:true}))
// app.use(cors({credentials: true, origin: "http://localhost:3000"}))
// app.use(upload())
// app.use('/uploads', express.static(__dirname + '/uploads'))
// app.use('/api/users', userRoutes)
// app.use('/api/posts', postRoutes)   

// app.use(bodyParser.json());
// app.use('/api', contactRoutes);


// app.use(notFound)
// app.use(errorHandler) 

// connect(process.env.MONGO_URI).then(app.listen(process.env.PORT || 5000,() => console.log(`Server started on port ${process.env.PORT}`))).catch(error => {console.log(error)})




const express = require('express');
const bodyParser = require('body-parser');
const contactRoutes = require('./routes/contactRoutes');
const cors = require('cors');
const { connect } = require('mongoose');
require('dotenv').config();
const upload = require('express-fileupload');

const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));

// Get allowed origins from environment variables
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

app.use(upload());
app.use('/uploads', express.static(__dirname + '/uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api', contactRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

// Database Connection and Server Start
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
    console.error("MONGO_URI environment variable is not defined.");
    process.exit(1);
}

connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    })
    .catch(error => {
        console.error("Database connection failed:", error);
        process.exit(1);
    });



// const express = require('express');
// const cors = require('cors');
// const { connect } = require('mongoose');
// require('dotenv').config();
// const upload = require('express-fileupload');

// const userRoutes = require('./routes/userRoutes');
// const postRoutes = require('./routes/postRoutes');
// const contactRoutes = require('./routes/contactRoutes'); // Import contact routes
// const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// const app = express();

// app.use(express.json({ extended: true }));
// app.use(express.urlencoded({ extended: true }));
// app.use(upload());

// const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500'];
// app.use(cors({
//   credentials: true,
//   origin: function (origin, callback) {
//     // Allow requests with no origin, like mobile apps or curl requests
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   }
// }));
// app.use('/uploads', express.static(__dirname + '/uploads'));

// // Existing routes
// app.use('/api/users', userRoutes);
// app.use('/api/posts', postRoutes);

// // New contact route
// app.use('/api/contact', contactRoutes); // Add this line

// app.use(notFound);
// app.use(errorHandler);

// connect(process.env.MONGO_URI)
//   .then(() => {
//     app.listen(process.env.PORT || 5000, () => console.log(`Server started on port ${process.env.PORT || 5000}`));
//   })
//   .catch(error => {
//     console.log(error);
//   });





