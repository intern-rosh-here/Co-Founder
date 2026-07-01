const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization');

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Remove "Bearer " from token
    const actualToken = token.startsWith('Bearer ') ? token.slice(7) : token;

    // Verify token
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};
