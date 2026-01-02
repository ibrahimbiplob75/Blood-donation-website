// Role-based authorization middleware
exports.checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Check if user is admin or the owner of the resource
exports.checkOwnerOrAdmin = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.resource && 
                    req.resource[resourceUserIdField] && 
                    req.resource[resourceUserIdField].toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        message: 'Access denied. You can only access your own resources.' 
      });
    }

    next();
  };
};
