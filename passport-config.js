const passport = require('passport');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const User = require('./app/Models/User')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require("dotenv").config();

function InitializePassport() {
    console.log("YOU ARE IN InitializePassport()")
    // Configure jwt strategy
    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    }, async (jwtPayload, done) => {
        console.log("YOU ARE INITIALIZING JWT")
        try {
            const user = await User.findById(jwtPayload.id);
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }));
    // Configure passport-oauth2 strategy
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            passReqToCallback: true,
            scope: ['profile', 'email']
        },
        async function (req, accessToken, refreshToken, profile, done) {
            console.log(process.env.GOOGLE_CLIENT_SECRET)
            try {
                //Find a user in the DB based on the users googleID, if the user exists the user will be logged in if the user doesn't exist
                //he will be registered ie saved in the database
                const user = await User.findOne({googleID: profile.id});
                console.log('THE USER->', user)
                if (!user) {
                    const user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleID: profile.id,
                        verified: true
                    })
                    await user.save();
                    return done(null, user);
                } else {
                    //found user. Return
                    return done(null, user);
                }
            } catch (err) {
                console.log('THE ERROR->', err)
                return done(err);
            }
        }
    ));

    passport.serializeUser(function (user, done) {
        console.log('serialize')
        done(null, user)
    })
    passport.deserializeUser(function (user, done) {
        console.log('deserialize')
        done(null, user)
    })
}


module.exports = InitializePassport



