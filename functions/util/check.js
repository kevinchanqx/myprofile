exports.sanityCheck = async (obj, template) => {
  const requiredFields = { ...template }

  for (let i = 0; i < Object.keys(requiredFields).length; i++) {
    const rf = Object.keys(requiredFields)[i]
    if (!obj.hasOwnProperty(rf)) return { pass: false, message: `Missing required field - ${rf}`}
  
    if (typeof obj[rf] !== requiredFields[rf]) return { pass: false, message: `Invalid data type. Expected ${rf} type: ${requiredFields[rf]}. Passed ${rf} type: ${typeof obj[rf]}`}
  }

  return { pass: true}
}

exports.isEmpty = (string = '') => {
  if (string.trim() === '') return true;
  else return false;
}

exports.validEmail = (email = '') => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (email.match(emailRegEx)) return true;
  else return false;
}
