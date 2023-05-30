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

// server.use(
//     cors({origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:4000', 'http://localhost:63342/praksa/node_test/fetch-test/fetch.html?_ijt=7j2ivutrqk9a962dg0vbhm1rku&_ij_reload=RELOAD_ON_SAVE']})
// );
// server.use(cors())

const corsOptions = {
    origin: 'http://localhost:3001',//<-- FRONTEND URL GOES HERE
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}

server.use(cors(corsOptions))


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

server.use('/rauth', AuthRoutes)
server.use('/rauth', isLoggedIn, ProtectedAuthRoutes)
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
const port = process.env.PORT

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