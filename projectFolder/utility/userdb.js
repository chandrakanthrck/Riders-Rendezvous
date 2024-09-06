const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27018/connectmongo');
const Schema = mongoose.Schema;

// Define the User Schema
const userSchema = new Schema({
  user_ID: {
    type: String,
    required: true
  },
  first_name: {
    type: String
  },
  last_name: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Create the User Model
const userModel = mongoose.model('users', userSchema);

// Retrieve user by user_ID
async function getUser(user_ID) {
  try {
    const data = await userModel.findOne({ user_ID: user_ID }).lean();
    return data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
}

// Retrieve user by email
async function getUserByEmail(email) {
  try {
    const user = await userModel.findOne({ email: email }).lean();
    return user;
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
}

// Retrieve user profile by email (userName)
async function getUserProfile(userName) {
  try {
    const profile = await userModel.findOne({ email: userName }).lean();
    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Add a new user with all required fields
async function addNewUser(email, password, first_name = '', last_name = '') {
  try {
    const userID = Math.floor(1000 + Math.random() * 9000).toString();
    const newUser = {
      user_ID: userID,
      email: email,
      password: password, // Remember to hash this before storing
      first_name: first_name,
      last_name: last_name
    };
    const createdUser = await userModel.create(newUser);
    return createdUser;
  } catch (error) {
    console.error('Error creating new user:', error);
    return null;
  }
}

module.exports = {
  getUser,
  getUserProfile,
  addNewUser,
  getUserByEmail
};