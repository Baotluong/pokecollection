import { StatusCodes } from 'http-status-codes';

export const checkBearerToken = (req, res, next) => {
  if (req.headers.authorization !== "Bearer moo") {
    return res.status(StatusCodes.UNAUTHORIZED).send('You are not allowed');
  }
  next();
};
