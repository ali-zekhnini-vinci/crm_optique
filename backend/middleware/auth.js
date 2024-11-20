const jwt = require('jsonwebtoken');

const verifyTokenAndRole = (requiredRole) => (req, res, next) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(401).json({ message: 'Access denied: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Access denied: Insufficient role' });
        }

        req.user = decoded.user;
        next();
    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

module.exports = { verifyTokenAndRole };
