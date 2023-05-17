const express = require('express');
const passport = require('passport');
const Strategy = require('passport-http-bearer').Strategy;
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// Mock database
const users = [
    {id: 1, username: 'user1', password: 'password1', token: 'token1'},
    {id: 2, username: 'user2', password: 'password2', token: 'token2'}
];

// Passport strategy
passport.use(new Strategy(
    function (token, done) {
        const user = users.find(user => user.token === token);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
));

// Register route
app.post('/register', (req, res) => {
    const {username, password} = req.body;
    const user = users.find(user => user.username === username);
    if (user) {
        res.status(400).json({message: 'Username already exists'});
    } else {
        const newUser = {
            id: users.length + 1,
            username,
            password,
            token: `token${users.length + 1}`
        };
        users.push(newUser);
        res.status(201).json({message: 'User created successfully'});
    }
});

// Login route
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        res.status(401).json({message: 'Invalid credentials'});
    } else {
        res.status(200).json({token: user.token});
    }
});

// Logout route
app.post('/logout', passport.authenticate('bearer', {session: false}), (req, res) => {
    req.logout(() => {
        res.status(200).json({message: 'Logged out successfully'});
    });
});

app.get('/secretPage', passport.authenticate('bearer', {session: false}), (req, res) => {
    res.send('This page is secret and can be viewed only when logged in')
});

app.listen(3000, () =>
    console.log(`Server is listening on port 3000...`)
);