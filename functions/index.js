// Utils
const {
  express
} = require('./util')

const functions = require("firebase-functions");

// Handlers
const { sso, user } = require("./handlers");

// Middlewares
const { firebaseMiddleware } = require("./middleware")
const { FBAuth } = firebaseMiddleware

const {
  app
} = express

/**
 * SSO routes
 */
app.post('/signup', sso.userSignup)
app.post('/login', sso.userLogin)

/**
 * User routes
 */
app.post('/user/upload/image', FBAuth, user.uploadImage)
app.post('/user/upload/resume', FBAuth, user.uploadResume)

exports.api = functions.region('asia-southeast1').https.onRequest(app)