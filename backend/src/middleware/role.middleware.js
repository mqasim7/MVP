// Role-based authorization middleware
const isAdmin = (req, res, next) => {
    if (req.userRole === 'admin') {
      next();
    } else {
      res.status(403).send({ message: "Require Admin Role!" });
    }
  };
  
  const isEditor = (req, res, next) => {
    if (req.userRole === 'admin' || req.userRole === 'editor') {
      next();
    } else {
      res.status(403).send({ message: "Require Editor Role!" });
    }
  };
  
  const roleMiddleware = {
    isAdmin,
    isEditor
  };
  
  module.exports = roleMiddleware;