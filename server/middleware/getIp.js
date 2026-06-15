const getIp = (req, res, next) => {
  const forwarded = req.headers["x-forwarded-for"];

  req.clientIp =
    (forwarded ? forwarded.split(",")[0] : null) ||
    req.socket.remoteAddress ||
    req.ip;

  console.log("IP DETECTED:", req.clientIp);

  next();
};

export default getIp;