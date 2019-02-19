module.exports = ({ body }, response, next) => {
  const nin = body.nin;
  const template = body.template;
  const fingerCode = body.fingerCode;

  let message = '';
  if(!nin) { message = 'NIN must be specified'; }
  if(!template) { message = 'Finger print template must be provided'; }
  if(!fingerCode) { message = 'Finger code must be specified'; }

  if(message) {
    response.status(422).send(message);
    console.log('Validation error:', message);
  } else {
    next();
  }
}