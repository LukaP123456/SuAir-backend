const express = require('express');
const server = express();
const device = require('express-device');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const cron = require("node-cron");
const schedule = require('node-schedule');
//CRON JOB
const get_hourly_data = require('./Jobs/get_hourly_data')
const get_daily_data = require('./Jobs/get_daily_data')
const get_monthly_data = require('./Jobs/get_monthly_data')
const scrape_districts = require('./Jobs/one-time-use/webscrape_districts')
const passport = require('passport');
const connectDB = require('./DB/connect')
const InvalidToken = require('./app/Models/InvalidToken')
require("dotenv").config();
const InitializePassport = require('./passport-config')
//ERROR HANDLERS CALL
const notFoundMiddleware = require('./middleware/not_found');
const errorHandlerMiddleware = require('./middleware/error_handler');
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
const async = require('async');
// -------------------------------------MIDDLEWARES START-------------------------------------
server.use(express.json()); // for parsing JSON bodies
server.use(express.urlencoded({extended: true})); // for parsing URL-encoded bodies
// Code below causes a memory leak when it runs on server?
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({mongoUrl: process.env.MONGO_COMPASS_URI})
}));
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
const corsOptions = {
    origin: ['http://localhost:3001', 'http://localhost:3000', 'https://suair-backend-production.up.railway.app/'],//<-- FRONTEND URL GOES HERE
    credentials: true,            //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}
server.use(cors(corsOptions))
server.use(xss())
server.use(flash())
server.use(device.capture());
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
server.get('/google/callback', passport.authenticate('google', {failureRedirect: '/auth/failure'}), (req, res) => {
    // Successful authentication
    res.json({user_id: req.user.id});
});
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
//Test cron jobs
const que = async.queue(async (task, callback) => {
    // This function will be called for each task in the queue
    // `task` is an object representing the cron job to run
    // `callback` is a function that must be called when the task is complete
    // Connect to mongoose before running the cron job
    await mongoose.connect(process.env.MONGO_COMPASS_URI);
    // Run the cron job
    await task.job();
    // Disconnect from mongoose after the cron job is complete
    await mongoose.disconnect();
    // Call the callback function to indicate that the task is complete
    callback();
}, 1); // Set the concurrency to 1 to ensure that only one task runs at a time
// cron.schedule('*/5 * * * * *', async () => {
//     // get_hourly_data(true)
//     que.push({job: get_hourly_data(true)});
// });
// cron.schedule('*/30 * * * * *', async () => {
//     // get_daily_data(true)
//     que.push({job: get_daily_data(true)});
// });
// cron.schedule('*/50 * * * * *', async () => {
//     // get_monthly_data(true)
//     que.push({job: get_monthly_data(true)});
// });
// console.log('========TIME 4 DISTRICTS========')
// scrape_districts()
cron.schedule('0 0 */2 * *', () => {
    get_hourly_data()
    console.log('Running every 48 hours');
});
cron.schedule('0 4 1 * *', () => {
    get_daily_data()
    console.log('running a task on the first day of every month at 4:00 AM');
});
cron.schedule('0 2 1 */3 *', () => {
    get_monthly_data()
    console.log('Running every three months on the first day of the month at 2:00 AM');
});