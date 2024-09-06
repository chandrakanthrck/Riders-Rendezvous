const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27018/connectmongo');

const Schema = mongoose.Schema;

// Define the connections schema
const connectionsSchema = new Schema({
  ID: {
    type: String,
    required: true
  },
  heading: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  diflev: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  loc: {
    type: String,
    required: true
  },
  going: {
    type: String,
    required: true
  },
  imgURL: {
    type: String
  }
});

// Create a Mongoose model
const connectionModel = mongoose.model('connections', connectionsSchema);

// Return all connections
async function getConnection() {
  try {
    return await connectionModel.find({}).lean();
  } catch (error) {
    console.error('Error fetching connections:', error);
    return null;
  }
}

// Return connection by ID
async function getConnectionsByID(ID) {
  try {
    return await connectionModel.findOne({ ID: ID }).lean();
  } catch (error) {
    console.error('Error fetching connection by ID:', error);
    return null;
  }
}

// Return connections by a list of IDs
async function getConnectionsByIDS(ID_ARRAY) {
  try {
    return await connectionModel.find({ ID: { "$in": ID_ARRAY } }).lean();
  } catch (error) {
    console.error('Error fetching connections by IDs:', error);
    return null;
  }
}

// Return unique categories (headings)
async function getuniqueCategories() {
  try {
    return await connectionModel.distinct("heading");
  } catch (error) {
    console.error('Error fetching unique categories:', error);
    return null;
  }
}

// Return distinct difficulty levels
async function getdiflev() {
  try {
    return await connectionModel.distinct("diflev");
  } catch (error) {
    console.error('Error fetching difficulty levels:', error);
    return null;
  }
}

// Listing function to group connections by headings
function listingFunction(abc) {
  const allHeadings = [...new Set(abc.map(x => x.heading))];
  let newArray = [];

  for (let i = 0; i < allHeadings.length; i++) {
    let subArray = abc.filter(item => item.heading === allHeadings[i]);
    newArray.push({
      key: allHeadings[i],
      list: subArray
    });
  }

  return newArray;
}

// Placeholder for sub-connections
const subsetconnection = [];

module.exports.getSubConnection = () => {
  return subsetconnection; // Stored connection
}

// Format saved connections with data from total connections
function getFormattedSavedConnections(subConnection, getTotalSubConnection) {
  for (let i = 0; i < getTotalSubConnection.length; i++) {
    for (let j = 0; j < subConnection.length; j++) {
      if (getTotalSubConnection[i].ID === subConnection[j].ID) {
        subConnection[j].diflev = getTotalSubConnection[i].diflev;
        subConnection[j].heading = getTotalSubConnection[i].heading;
        break;
      }
    }
  }

  return subConnection;
}

// Export functions
module.exports = {
  getConnection,
  getConnectionsByID,
  getuniqueCategories,
  getdiflev,
  listingFunction,
  getConnectionsByIDS,
  getFormattedSavedConnections
};