
module.exports = (error, request, response, next) => {
  if(error.response && error.response.status) {
    console.log('HTTP Response error:', error.response.status);
    response.sendStatus(error.response.status);
  } else {
    console.log(error);
    next(error);
  } 
};