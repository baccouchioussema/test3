const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

module.exports.checkUser = async(req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if (token) {
            const deccodedToken = await jwt.verify(token, process.env.TOKEN_SECRET)
            if (!deccodedToken) {
                res.locals.user = null;
                res.cookie('jwt', '', { maxAge: 1 });
                next();
            }else {
          
                let user = await UserModel.findById(deccodedToken.id);
                res.locals.user = (user);
                // console.log(res.locals.user);
                next();
            }
        }       
    } catch (error) {
        console.log(error)
        res.locals.user = null;
        next();
    }

}


module.exports.requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async(err, deccodedToken) => {
            if (err) {
                console.log(err);

            } else{
                // console.log(deccodedToken.id);
                next();
            }
        });
    } else {
        console.log('No token');
    }


};

