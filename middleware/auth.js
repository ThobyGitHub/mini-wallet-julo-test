const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token = req.get("authorization");

  if (!token) {
    return res.status(403).json({status: "fail", data: { token : "A token is required for authentication"}});
  }
  try {
    token = token.split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    console.log(err);
    return res.status(401).json({status: "fail", data: { token : "Invalid Token"}});
  }
  return next();
};

module.exports = verifyToken;