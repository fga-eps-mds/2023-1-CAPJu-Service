import jwt from "jsonwebtoken";
import User from "../models/User.js";

async function protect(req, res, next) {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findByPk(decoded.id);
      if (req.user.accepted === false) {
        throw new Error();
      }

      next();
    } catch (error) {
      console.log(error);
      return res.status(401).send();
    }
  }

  if (!token) {
    return res.status(401).send();
  }
}

// Role authorization function
export const authRole = (roleArray) => (req, res, next) => {
  function searchRole(value) {
    return value == req.user.idRole;
  }
  let filtered = roleArray.filter(searchRole);
  if (req.user.idRole == filtered) {
    return next();
  }
  return res.status(401).json({
    sucess: false,
    message: "Acesso Negado: Perfil sem permissão ",
  });
};

export { protect };
