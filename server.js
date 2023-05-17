const express = require('express');
const cron = require("node-cron");
//CRON JOB
const getData = require('./Jobs/get_aqi_data_job')
const session = require('express-session')
const server = express();
const passport = require('passport');
server.use(session({
    secret: 'cat',
    resave: false,
    saveUninitialized: true
}));
const bcrypt = require('bcryptjs')
const connectDB = require('./DB/connect')
const User = require('./app/Models/User')
const InvalidToken = require('./app/Models/InvalidToken')
const VerificationToken = require('./app/Models/VerificationToken')
const sendEmail = require("./email");
const crypto = require("crypto");
require("dotenv").config();
const InitializePassport = require('./passport-config')
const jwt = require('jsonwebtoken');
//ERROR HANDLERS CALL
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const AuthRouter = require('./Routes/AuthRoutes')
const ProtectedAuthRouter = require('./Routes/ProtectedAuthRoutes')
//SWAGGER
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')
//EXTRA SECURITY
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimiter = require('express-rate-limit')
// -------------------------------------MIDDLEWARES START-------------------------------------
server.use(express.json()); // for parsing JSON bodies
server.use(express.urlencoded({extended: true})); // for parsing URL-encoded bodies
server.use(passport.initialize());
server.use(passport.session());
//RATE LIMITER, LIMIT NO OF API CALLS
server.set('trust proxy', 1)
server.use(
    rateLimiter({
        windowMs: 15 * 6 * 1000,//15 minutes
        max: 100 //limit each IP to 199 request per windowMs
    })
)
server.use(helmet())
server.use(cors({
    origin: 'http://localhost:4000/',//<--- location of the frontend
    credentials: true
}))
server.use(xss())
server.use(flash())
// -------------------------------------MIDDLEWARES END-------------------------------------
// -------------------------------------ROUTES START-------------------------------------
InitializePassport()
server.set('view-engine', 'ejs')

server.use('/auth', AuthRouter)
server.use('/auth', isLoggedIn, ProtectedAuthRouter)

// -------------------------------------GOOGLE AUTH ROUTES START-------------------------------------
//test

server.get('/google/success', isLoggedIn, (req, res) => {
    res.send('success')
})
server.get('/protectedRoute', isLoggedIn, (req, res) => {
    res.send('YOu are on the protected route')
})
server.get('/google/failure', (req, res) => {
    res.send('failure')
})

server.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>')
})

server.get('/authFailure', (req, res) => {
    res.send('Something went wrong..')
})

server.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/google/success',
    failureRedirect: '/google/failure'
}))

async function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1].trim();
        const invalidToken = await InvalidToken.findOne({token: token});
        if (invalidToken) {
            res.redirect('/')
            // return res.status(401).json({message: 'Unauthorized please register or log in'});
        }
        return next();
    }
    res.redirect('/')
}

// -------------------------------------GOOGLE AUTH ROUTES END-------------------------------------
server.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))


// -------------------------------------ROUTES END-------------------------------------

server.use(notFoundMiddleware);
server.use(errorHandlerMiddleware);
const port = 3000

const start = async () => {
    try {
        await connectDB('mongodb://lukaprcic:compassPass@localhost:27017/?authMechanism=DEFAULT')
        server.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();
//CRON JOBS
// cron.schedule('* * * * *', getData);