const InvalidToken = require("../Models/InvalidToken");
const jwt = require('jsonwebtoken');


const logout = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.logout(function (err) {
            if (err) {
                return next(err);
            }
            res.redirect('/');
        });
        req.session.destroy();
        res.send('Goodbye')
    } else {
        //User is authenticated with JWT
        const token = req.headers.authorization.split(' ')[1];
        const secret_key = process.env.JWT_SECRET
        jwt.verify(token, secret_key, (err, decoded) => {
            if (err) {
                return res.status(401).json({message: 'Invalid token'});
            }
            const invalidToken = new InvalidToken({token});
            invalidToken.save();
            res.clearCookie('access_token')
            res.status(200).json({message: 'Logout successful'});
        });
    }
}

module.exports = {
    logout
}