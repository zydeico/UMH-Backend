const jwt = require('jsonwebtoken');

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
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token on authentication' });
        }
        req.decoded = decoded;
        next();
    });    
}

module.exports = {
    verifyToken
};
