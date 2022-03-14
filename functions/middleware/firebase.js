const {
  firebase
} = require('../util')

const {
  admin
} = firebase

const db = admin.firestore()

exports.FBAuth = (req, res, next) => {
  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('No token found')
    return res.status(403).json({
      message: 'Unauthorized'
    })
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.body.currentUser = decodedToken

      return db
        .collection('users')
        .where('uid', '==', req.body.currentUser.uid)
        .limit(1)
        .get()
    }) 
    .then(data => {
      req.body.currentUser.username = data.docs[0].data().username
      return next()
    })
    .catch(err => {
      console.error('Error while verifying token ', err)
      return res.status(403).json(err)
    })
}