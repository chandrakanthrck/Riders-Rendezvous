const mongoose = require('mongoose');
const connectionDB = require('./connectionDB');
mongoose.connect('mongodb://localhost:27018/connectmongo');
const Schema = mongoose.Schema;

// User Connection Schema
const userConnectionSchema = new Schema({
    user_ID: {
        type: String,
        required: true
    },
    ID: {
        type: String,
        required: true
    },
    RSVP: {
        type: String,
        required: true
    },
});

const userConnectionModel = mongoose.model('userconnections', userConnectionSchema);
const connectionModel = mongoose.model('connections', connectionDB.connectionsSchema);

// Get all connections for a user
async function getUsersConnections(user_ID) {
    try {
        return await userConnectionModel.find({ user_ID: String(user_ID) }).lean();
    } catch (error) {
        console.error('Error getting user connections:', error);
        return null;
    }
}

// Get RSVP data for a user
async function getUserRSVPd(user_ID) {
    try {
        return await userConnectionModel.find({ user_ID }).lean();
    } catch (error) {
        console.error('Error getting user RSVP data:', error);
        return null;
    }
}

// Insert a new RSVP
async function addRSVP(rsvp, passedID) {
    try {
        const userConnection = {
            "ID": passedID,
            "RSVP": rsvp
        };
        return await userConnectionModel.create(userConnection);
    } catch (error) {
        console.error('Error adding RSVP:', error);
        return null;
    }
}

// Update existing RSVP
async function updateRSVP(rsvp, passedID, user_ID) {
    try {
        const userConnection = {
            "ID": passedID,
            "user_ID": user_ID,
            "RSVP": rsvp
        };
        return await userConnectionModel.updateOne({ ID: passedID, user_ID: user_ID }, userConnection);
    } catch (error) {
        console.error('Error updating RSVP:', error);
        return null;
    }
}

// Add or update RSVP for a connection
async function addOrUpdateRSVP(user_ID, ID, RSVP) {
    try {
        return await userConnectionModel.updateOne(
            { user_ID, ID: String(ID) },
            { RSVP },
            { upsert: true, new: true }
        ).lean();
    } catch (error) {
        console.error('Error adding or updating RSVP:', error);
        return null;
    }
}

// Delete a connection
async function deleteConnection(ID, user_ID) {
    try {
        return await userConnectionModel.deleteOne({ ID: ID, user_ID: user_ID }).lean();
    } catch (error) {
        console.error('Error deleting connection:', error);
        return null;
    }
}

// Add a new connection
async function addingConnection(conn) {
    try {
        const id = '998' + Math.floor(Math.random() * 10 + 7);
        const defaultImage = "/assets/rider.jpg";
        const newConnection = {
            "ID": id,
            "heading": conn.heading,
            "name": conn.name,
            "diflev": conn.diflev,
            "details": conn.details,
            "date": conn.date,
            "time": conn.time,
            "loc": conn.loc,
            "imgURL": defaultImage
        };
        return await connectionModel.create(newConnection);
    } catch (error) {
        console.error('Error adding new connection:', error);
        return null;
    }
}

module.exports = {
    getUserRSVPd,
    addRSVP,
    updateRSVP,
    addingConnection,
    deleteConnection,
    getUsersConnections,
    addOrUpdateRSVP
};