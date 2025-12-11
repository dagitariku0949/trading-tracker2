// Owner authentication middleware
const ownerAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Access denied. Owner authentication required.' 
    });
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  // In production, you'd verify JWT tokens or use proper authentication
  // For now, we'll check for a specific owner token pattern
  if (!token || !token.includes('owner')) {
    return res.status(403).json({ 
      error: 'Invalid owner credentials. Access forbidden.' 
    });
  }
  
  // Log access attempt
  console.log(`Owner access granted at ${new Date().toISOString()}`);
  
  next();
};

module.exports = ownerAuth;