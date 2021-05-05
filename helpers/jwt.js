// JSON WEB TOKEN 
// Check token 
const expressJwt = require('express-jwt');
const jwt = require('jsonwebtoken')
const { User } = require('../models/user');


function authJwt() {
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked //User Role
    }).unless({
        path: [
            { url: /\/public\/upload(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/sites(.*)/, methods: ['GET', 'OPTIONS'] },
            { url: /\/api\/v1\/categories(.*)/, methods: ['GET', 'OPTIONS'] },
            `${api}/users/login`,
            `${api}/users/register`,
            `${api}/users/changePassword`,
            `${api}/users/updateUser`,
            `${api}/users/getCurrentUser`,
        ]
    })
}


const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.secret, async (err, userVal) => {
            if (err) {
                return res.sendStatus(403);
            }

            const user = await User.findById(userVal.id);
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

async function isRevoked(req, payLoad, done) {
    if (!payLoad.isAdmin) {
        done(null, true)
    }
    done();
}
module.exports = { authJwt, authenticateJWT };