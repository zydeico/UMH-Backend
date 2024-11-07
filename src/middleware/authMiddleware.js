const jwt = require('jsonwebtoken');

// Blacklist to store invalid tokens
const blacklist = new Set();

function verifyToken(req, res, next) {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
        return res.status(401).json({ message: 'Token not provided' });
    }

    const parts = authorizationHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Invalid token format' });
    }
    const token = parts[1];

    if (blacklist.has(token)) {
        return res.status(401).json({ message: 'Token is blacklisted' });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            blacklist.add(token);
            return res.status(401).json({ message: 'Invalid token on authentication' });
        }
        req.decoded = decoded;
        next();
    });
}

module.exports = {
    verifyToken,
    blacklist
};