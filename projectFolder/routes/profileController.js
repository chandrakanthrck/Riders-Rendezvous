const express = require('express');
const router = express.Router();
const app = express();
const userDB = require('../utility/userdb');
const bodyParser = require('body-parser');
const userProfileDB = require('../utility/userProfileDB');
const bcrypt = require('bcrypt');
const connectionDB = require("../utility/connectionDB");
const { check, validationResult } = require('express-validator');

const urlEncodedParser = bodyParser.urlencoded({ extended: false });

app.set('view engine', 'ejs');

// GET: Login Page
router.get('/login', (req, res) => {
    res.render('login', {
        user: req.session.theUser,
        errors: null
    });
});

// GET: Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// POST: Login with Validation
router.post('/login', [
    check('username').isEmail().withMessage('Please enter a valid email.'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render('login', { user: null, errors: errors.array() });
    }

    const { username, password } = req.body;
    try {
        const userExist = await userDB.getUserByEmail(username);

        if (!userExist) {
            return res.render('login', { user: null, errors: [{ msg: "User not found." }] });
        }

        const match = await bcrypt.compare(password, userExist.password);
        if (match) {
            req.session.theUser = userExist;
            const subConnections = await loadUserConnections(userExist.user_ID);
            return res.render('savedConnections', { data: subConnections, user: req.session.theUser });
        } else {
            return res.render('login', { user: null, errors: [{ msg: "Invalid credentials." }] });
        }
    } catch (error) {
        console.error(error);
        return res.render('login', { user: null, errors: [{ msg: "An error occurred during login." }] });
    }
});

// Helper function to load user connections
async function loadUserConnections(user_ID) {
    const subConnections = await userProfileDB.getUsersConnections(user_ID);
    const ID_ARRAY = subConnections.map(x => x.ID);
    const getTotalSubConnection = await connectionDB.getConnectionsByIDS(ID_ARRAY);
    return connectionDB.getFormattedSavedConnections(subConnections, getTotalSubConnection);
}

// GET: Home page
router.get('/', (req, res) => {
    res.render('index', { user: req.session.theUser });
});

// GET: About page
router.get('/about', (req, res) => {
    res.render('about', { user: req.session.theUser });
});

// GET: Contact page
router.get('/contact', (req, res) => {
    res.render('contact', { user: req.session.theUser });
});

// GET: New Connection Page
router.get('/newConnection', (req, res) => {
    res.render('newConnection', { user: req.session.theUser, error: null });
});

// POST: Add New Connection with Validation
router.post('/newConnection', urlEncodedParser, [
    check('heading').matches(/^[a-z ]+$/i).withMessage('Heading should only contain letters.'),
    check('name').isAlphanumeric().withMessage('Name should contain only alphanumeric characters.'),
    check('diflev').isAlphanumeric().withMessage('Difficulty level should be alphanumeric.'),
    check('details').isLength({ min: 3 }).withMessage('Details should be at least 3 characters long.'),
    check('date').isISO8601().withMessage('Invalid date format.'),
    check('time').matches(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format.'),
    check('loc').isLength({ min: 3 }).withMessage('Location should be at least 3 characters long.')
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('newConnection', { user: req.session.theUser, error: errors.array() });
    }

    try {
        await connectionDB.addingConnection(req.body);
        res.redirect('/connections');
    } catch (error) {
        console.error(error);
        res.render('newConnection', { user: req.session.theUser, error: [{ msg: 'Error adding connection. Please try again.' }] });
    }
});

// GET: Connections Page
router.get('/connections', async (req, res) => {
    try {
        const data = await connectionDB.getConnection();
        const dynamicData = connectionDB.listingFunction(data);
        res.render('connections', { dataNew: dynamicData, user: req.session.theUser });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

// GET: Saved Connections
router.get('/connection/savedconnections', async (req, res) => {
    const sessionUserProfile = req.session.theUser;

    if (!sessionUserProfile) {
        return res.redirect('/login');
    }

    try {
        const subConnections = await loadUserConnections(sessionUserProfile.user_ID);
        const { ID, delete: deleteQuery, RSVP } = req.query;

        if (deleteQuery === 'true') {
            await userProfileDB.deleteConnection(ID, sessionUserProfile.user_ID);
            const updatedConnections = await loadUserConnections(sessionUserProfile.user_ID);
            return res.render('savedConnections', { data: updatedConnections, user: req.session.theUser });
        }

        if (RSVP && ['Yes', 'No', 'Maybe'].includes(RSVP)) {
            await userProfileDB.addOrUpdateRSVP(sessionUserProfile.user_ID, ID, RSVP);
        }

        res.render('savedConnections', { data: subConnections, user: req.session.theUser });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

// GET: Connection by ID
router.get('/connection/:ID', [
    check("ID").isNumeric().withMessage("Invalid Connection ID.")
], async (req, res) => {
    const { ID } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.redirect("/connections");
    }

    try {
        const connection = await connectionDB.getConnectionsByID(ID);
        if (connection) {
            res.render('connection', { data: connection, user: req.session.theUser });
        } else {
            res.send('No Connection found.');
        }
    } catch (error) {
        console.error(error);
        res.render('error');
    }
});

// GET: Error page for undefined routes
router.get('*', (req, res) => {
    res.render('error');
});

module.exports = router;