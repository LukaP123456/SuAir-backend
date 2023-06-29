const User = require('../Models/User')
const bcrypt = require("bcryptjs");
const VerificationToken = require("../Models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../../email");
const {StatusCodes} = require("http-status-codes");
const {BadRequestError, UnauthenticatedError} = require("../../errors");
const jwt = require('jsonwebtoken');
const {lookup} = require('geoip-lite');
const JWTregister = async (req, res, next) => {
    try {
        const {name, email, password} = req.body
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const ip_address = req.socket.localAddress
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        const user_agent = req.get('User-Agent');
        const language = req.headers["accept-language"];
        console.log(lookup(ip_address), ip_address, ip)
        process.exit()
        const user = await new User({
            name: name,
            email: email,
            password: hashedPassword
        }).save()
        console.log(user)
        let verificationToken = await new VerificationToken({
            userId: user._id,
            token: crypto.randomBytes(32).toString("hex"),
        }).save();
        const verificationLink = `${process.env.BASE_URL}/rauth/verify/${user.id}/${verificationToken.token}`;
        console.log(verificationLink)
        await sendEmail('SuAir@gmail.com', "Verification Email for SuAir", user.email, verificationLink);
        res.status(StatusCodes.CREATED).send(`User created, email has been sent to your account ${user.email}`)
    } catch (error) {
        next(error)
        console.log(error)
    }
}
const JWTverify = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.params.id});
        console.log(user)
        if (!user) return res.status(400).send("Invalid link");
        const token = await VerificationToken.findOne({
            userId: user._id,
            token: req.params.token,
        });
        console.log(token)
        if (!token) return res.status(400).send("Invalid link");
        await user.updateOne({verified: true});
        await VerificationToken.findByIdAndRemove(token._id);
        console.log('Email verified successfully')
        // res.redirect('/user-verified');//React login page goes here
        res.send('You have been verified');//React login page goes here
    } catch (error) {
        res.status(400).redirect('/login?e=error-message');//React login page goes here
        // res.status(400).send("An error occurred");
        console.log(error)
    }
}

const JWTlogin = async (req, res, next) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            throw new BadRequestError('Please provide email and password')
        }
        const user = await User.findOne({email: email, verified: true});
        console.log(user)
        if (!user) {
            throw new UnauthenticatedError('Invalid credentials')
        }
        const isPasswordCorrect = await user.comparePassword(password)
        if (!isPasswordCorrect) {
            throw new UnauthenticatedError('Invalid credentials')
        }
        const secret_key = process.env.JWT_SECRET
        if (user && isPasswordCorrect) {
            const token = jwt.sign({id: user._id, name: user.name, email: user.email}, secret_key, {expiresIn: '1d'});
            // const token = jwt.sign({id: user._id}, secret_key);
            res.status(200).json({token});
        } else {
            res.status(401).json({message: 'Invalid email or password'});
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    JWTlogin, JWTverify, JWTregister
}