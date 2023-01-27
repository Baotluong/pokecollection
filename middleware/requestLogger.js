export const logRequest = (req, res, next) => {
  console.log('Original URL', req.originalUrl);

  if (Object.keys(req.body).length) {
    console.log('Body', req.body);
  }
  
  next();
};
