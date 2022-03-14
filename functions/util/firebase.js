/**
 * Credential files
 */
const cred = require('../credential/cred.json')
const firebaseConfig = require('../credential/config.json')

/**
 * Firebase App
 */
const firebaseApp = require('firebase/app')
firebaseApp.initializeApp(firebaseConfig)

/**
 * Firebase Admin
 */
const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.cert(cred),
  storageBucket: firebaseConfig.storageBucket
})

/**
 * Firebase Auth
 */
const firebaseAuth = require('firebase/auth')
const auth = firebaseAuth.getAuth()

module.exports = {
  firebaseApp,
  firebaseAuth,
  auth,
  admin,
}