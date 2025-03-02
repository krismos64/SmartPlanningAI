const adminCredentials = {
  username: "admin@admin.fr",
  password: "admin",
};

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("Authorization Header:", authHeader);

  if (!authHeader) {
    console.log("Authorization header missing");
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const [type, credentials] = authHeader.split(" ");

  if (type !== "Basic" || !credentials) {
    console.log("Invalid authorization format");
    return res.status(401).json({ message: "Invalid authorization format" });
  }

  const [username, password] = Buffer.from(credentials, "base64")
    .toString()
    .split(":");

  console.log("Decoded Credentials:", username, password);

  if (
    username === adminCredentials.username &&
    password === adminCredentials.password
  ) {
    console.log("Authentication successful");
    return next();
  }

  console.log("Invalid credentials");
  return res.status(401).json({ message: "Invalid credentials" });
};

module.exports = authMiddleware;
