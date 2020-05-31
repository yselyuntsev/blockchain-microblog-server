const jwt = require("jsonwebtoken");

function generate(payload) {
  return jwt.sign(payload, "very!secret!private!key");
}
function verify(req, res, next) {
  const token = req.header("Authorization");

  if (!token)
    return res.status(401).send({ error: "Access denied! Token not found!" });

  try {
    jwt.verify(token, "very!secret!private!key");
    next();
  } catch (error) {
    return res.status(400).send({ error: "Invalid token!" });
  }
}

module.exports = {
  generate,
  verify,
};
