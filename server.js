const express = require('express');
const server = express();
const session = require('express-session')
server.use(session({
    secret: 'cat',
    resave: false,
    saveUninitialized: true
}));
const cron = require("node-cron");
//CRON JOB
const getData = require('./Jobs/get_aqi_data_job')
const passport = require('passport');
const connectDB = require('./DB/connect')
const InvalidToken = require('./app/Models/InvalidToken')
require("dotenv").config();
const InitializePassport = require('./passport-config')
//ERROR HANDLERS CALL
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const AuthRoutes = require('./Routes/AuthRoutes')
const ProtectedAuthRoutes = require('./Routes/ProtectedAuthRoutes')
const DistrictRoutes = require('./Routes/DistrictRoutes')
const AQIRoutes = require('./Routes/AQIRoutes')
//SWAGGER
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')
//EXTRA SECURITY
const flash = require('express-flash')
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

async function isLoggedIn(req, res, next) {
    console.log('YOU ARE IN isLoggedIn')
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
}

server.use('/JWTauth', AuthRoutes)
server.use('/JWTauth', isLoggedIn, ProtectedAuthRoutes)
server.use('/districts', isLoggedIn, DistrictRoutes)
server.use('/AQI', isLoggedIn, AQIRoutes)

// -------------------------------------GOOGLE AUTH ROUTES START-------------------------------------
server.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google </a>')
})
server.get('/protected', isLoggedIn, (req, res) => {
    console.log(req.user)
    res.send(`Hello ${req.user.name}`)
})
server.get('/auth/google', passport.authenticate('google', {scope: ['email', 'profile']}))
server.get('/google/callback', passport.authenticate('google', {
    successRedirect: '/protected',
    failureRedirect: '/auth/failure',
}))
server.get('/auth/failure', (req, res) => {
    res.send('Something went wrong')
})
server.get('/logout', (req, res) => {
    req.logout()
    res.send('Goodbye')
})

// -------------------------------------GOOGLE AUTH ROUTES END-------------------------------------
server.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

// -------------------------------------ROUTES END-------------------------------------

server.use(notFoundMiddleware);
server.use(errorHandlerMiddleware);
const port = 3000

const start = async () => {
    try {
        await connectDB(process.env.MONGO_COMPASS_URI)
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