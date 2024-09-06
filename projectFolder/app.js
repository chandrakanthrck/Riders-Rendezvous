const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();

// Import route controllers
const controller = require('./routes/connectionController');
const profileController = require('./routes/profileController');

// Set the views directory and view engine
app.set("views", path.join(__dirname, "views"));  
app.set('view engine', 'ejs');

// Middleware for parsing JSON and form-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session management
app.use(session({
  secret: 'your-strong-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set secure: true if using HTTPS
}));

// Serve static files
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/partials", express.static(path.join(__dirname, "partials")));

// Use controllers for routes
app.use('/', profileController);   
app.use('/', controller); 

// Start the server
const PORT = process.env.PORT || 9007;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export the app for testing or further configuration
module.exports = app;