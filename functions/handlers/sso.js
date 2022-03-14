const { 
  sanityCheck,
  isEmpty,
  validEmail
} = require('../util/check')

const {
  admin,
  auth,
  firebaseAuth
} = require('../util/firebase')

const db = admin.firestore()

/**
 * User sign up
 */
 exports.userSignup = async (req, res) => {
  const template = {
    email: 'string',
    username: 'string',
    password: 'string',
    confirmPassword: 'string'
  }

  const error = {}

  const item = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  
  await sanityCheck(item, template)
    .then(data => {
      if (!data.pass) return res.status(401).json({
        error: {
          message: data.message
        }
      })
    })

  // Check empty
  const checkFields = ['email', 'username', 'password']

  checkFields.forEach(field => {
    if (isEmpty(item[field])) error[field] = `${field} cannot be empty!`
  })

  if (item.email !== '' && !validEmail(item.email)) error.email = 'Invalid email format!' 

  if (item.password !== item.confirmPassword) error.confirmPassword = 'Password is not matched!'

  if (Object.keys(error).length) return res.status(401).json({
    error
  })
  
  const newUser = {
    email: item.email,
    password: item.password,
    confirmPassword: item.confirmPassword,
    username: item.username
  }

  const noImg = 'no-img.webp'
  
  let generatedToken, uid;
  
  db
    .doc(`/users/${newUser.username}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res
          .status(400)
          .json({
            error: {
              message: 'This username has been taken!'
            }
          })
      } else {
        return firebaseAuth
          .createUserWithEmailAndPassword(auth, newUser.email, newUser.password)
          .catch(err => {
            console.log('[USER SIGN UP] => [CREATE USER] Error - ', err)
            if (err.code === 'auth/email-already-in-use') {
              return res.status(400).json({
                error: {
                  message: 'Email is already in use'
                }
              })
            }
            return res.status(500).json({ 
              error: {
                message: err.code 
              }
            })
          })
      }
    })
    .then(data => {
      uid = data.user.uid

      return data.user.getIdToken()
    })
    .then(token => {
      const userCredentials = {
        username: newUser.username,
        email: newUser.email,
        createdAt: new Date().toString(),
        uid,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${noImg}?alt=media`
      }

      generatedToken = token

      return db
        .doc(`/users/${newUser.username}`)
        .set(userCredentials)
    })
    .then(() => {
      return res.status(201).json({
        token: generatedToken
      })
    })
    .catch(err => {
      console.log(`[USER SIGN UP] Error - ${err}`)
      return res.status(500).json({
        error: {
          message: 'Something went wrong',
        }
      })
    })
}

/** 
 * User log in
 */
exports.userLogin = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  }

  let error = {}

  const checkFields = ['email', 'password']
  checkFields.forEach(field => {
    if (isEmpty(user[field])) error[field] = `${field} cannot be empty!`
  })

  if (Object.keys(error).length) return res.status(401).json({
    error
  })

  firebaseAuth
    .signInWithEmailAndPassword(auth, user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token })
    })
    .catch(err => {
      console.error(err)
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({
          error: {
            message: 'Wrong credentials, please try again!'
          }
        })
      }
      return res.status(500).json({ error: err.code })
    })
}
