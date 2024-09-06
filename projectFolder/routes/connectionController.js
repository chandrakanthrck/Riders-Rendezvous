const express = require('express');
const router = express.Router();
const app = express();
const { check, validationResult } = require('express-validator');
const userProfileDB = require('../utility/userProfileDB');
const connectionDB = require("../utility/connectionDB");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const urlEncodedParser = bodyParser.urlencoded({ extended: false });

app.set('view engine', 'ejs');

// GET: Home page
router.get('/', function (req, res) {
    res.render('index', { user: req.session.theUser });
});

// GET: Index page
router.get('/index', function (req, res) {
    res.render('index', { user: req.session.theUser });
});

// GET: About page
router.get('/about', function (req, res) {
    res.render('about', { user: req.session.theUser });
});

// GET: Contact page
router.get('/contact', function (req, res) {
    res.render('contact', { user: req.session.theUser });
});

// GET: New Connection page
router.get('/newConnection', function (req, res) {
    const user = req.session.theUser;
    if (user == null) {
        res.render('newConnection', { user: null, error: undefined, flag: true });
    } else {
        res.render('newConnection', { user: user, error: undefined, flag: false });
    }
});

// POST: Add new connection
router.post('/newConnection', urlEncodedParser, async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('newConnection', {
            user: req.session.theUser,
            error: errors.array(),
            flag: false
        });
    }

    try {
        const data = req.body;
        const user = req.session.theUser;
        if (user) {
            await userProfileDB.addaConnection(data);
            res.redirect('/connections');
        } else {
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

// GET: List of connections
router.get('/connections', async function (req, res) {
    try {
        const data = await connectionDB.getConnection();
        const dynamicData = await connectionDB.listingFunction(data);
        const categories = await connectionDB.getuniqueCategories();
        res.render('connections', { dataNew: dynamicData, user: req.session.theUser });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

// GET: Saved connections for the user
router.get('/connection/savedconnections', async function (req, res) {
    const sessionUserProfile = req.session.theUser;

    if (!sessionUserProfile) {
        res.redirect('/login');
        return;
    }

    try {
        let subConnection = await userProfileDB.getUsersConnections(sessionUserProfile['user_ID']);
        let ID_ARRAY = subConnection.map(x => x.ID);
        let getTotalSubConnection = await connectionDB.getConnectionsByIDS(ID_ARRAY);

        subConnection = connectionDB.getFormattedSavedConnections(subConnection, getTotalSubConnection);

        if (!parseInt(req.query.ID)) {
            return res.render('savedConnections', { data: subConnection, user: req.session.theUser });
        }

        const ID = req.query.ID;
        const deleteQuery = req.query.delete;

        if (deleteQuery === 'true') {
            await userProfileDB.deleteConnection(ID, sessionUserProfile['user_ID']);
            subConnection = await userProfileDB.getUsersConnections(sessionUserProfile['user_ID']);
            ID_ARRAY = subConnection.map(x => x.ID);
            getTotalSubConnection = await connectionDB.getConnectionsByIDS(ID_ARRAY);
            subConnection = connectionDB.getFormattedSavedConnections(subConnection, getTotalSubConnection);

            return res.render('savedConnections', { data: subConnection, user: req.session.theUser });
        }

        const rsvp = req.query.RSVP;
        await userProfileDB.addOrUpdateRSVP(sessionUserProfile['user_ID'], ID, rsvp);

        subConnection = await userProfileDB.getUsersConnections(sessionUserProfile['user_ID']);
        ID_ARRAY = subConnection.map(x => x.ID);
        getTotalSubConnection = await connectionDB.getConnectionsByIDS(ID_ARRAY);
        subConnection = connectionDB.getFormattedSavedConnections(subConnection, getTotalSubConnection);

        res.render('savedConnections', { data: subConnection, user: req.session.theUser });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

// GET: Individual connection by ID
router.get('/connection/:ID', async function (req, res) {
    const ID = req.params.ID;

    try {
        if (ID) {
            const result = await connectionDB.getConnectionsByID(ID);
            if (result) {
                res.render('connection', { data: result, user: req.session.theUser });
            } else {
                res.send('No Connection Code available');
            }
        } else {
            res.render('connections', { data: [], categories: [], user: req.session.theUser });
        }
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

// Catch-all route for undefined routes
router.get('*', function (req, res) {
    res.render('error');
});

module.exports = router;