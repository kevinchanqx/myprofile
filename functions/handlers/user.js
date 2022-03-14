// Config
const { storageBucket } = require('../credential/config.json')

// Third party package
const BusBoy = require('busboy')
const path = require('path')
const os = require('os')
const fs = require('fs')

// Util
const {
  firebase
} = require('../util')

const {
  admin
} = firebase

const db = admin.firestore()

/**
 * User upload profile image
 */
exports.uploadImage = (req, res) => {
  const busboy = BusBoy({ headers: req.headers });

  let imageFileName;
  let imageToBeUploaded = {};

  busboy.on('file', (fieldname, file, fileInfo) => {
    console.log("FIELDNAME", fieldname)
    console.log("FILE INFO", fileInfo)

    const imageExtension = fileInfo.filename.split('.')[fileInfo.filename.split('.').length - 1]
    imageFileName = `${Math.round(Math.random()*100000000000)}.${imageExtension}`

    const filePath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filePath, mimeType: fileInfo.mimeType };

    file.pipe(fs.createWriteStream(filePath))
  })
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filePath, {
        resumable: false,
        contentType: imageToBeUploaded.mimeType
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${imageFileName}?alt=media`

        return db
          .doc(`/users/${req.body.currentUser.username}`)
          .update({
            imageUrl
          })
          .then(() => {
            return res
              .status(201)
              .json({
                mesasge: 'Image uploaded successfully.'
              })
          })
          .catch(err => {
            console.log(`[USER UPLOAD IMAGE] Error - ${err}`)
            return res
              .status(500)
              .json({
                error: {
                  message: 'Something went wrong.'
                }
              })
          })
      })
  })
  busboy.end(req.rawBody)
}

/**
 * User update details
 */
exports.uploadResume = (req, res) => {
  const busboy = BusBoy({ headers: req.headers });

  let pdfFileName;
  let pdfToBeUploaded = {};

  busboy.on('file', (fieldname, file, fileInfo) => {
    const pdfExtension = fileInfo.filename.split('.')[fileInfo.filename.split('.').length - 1]

    pdfFileName = `${Math.round(Math.random()*100000000000)}.${pdfExtension}`

    const filePath = path.join(os.tmpdir(), pdfFileName);
    pdfToBeUploaded = { filePath, mimeType: fileInfo.mimeType }

    file.pipe(fs.createWriteStream(filePath))
  })
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(pdfToBeUploaded.filePath, {
        resumable: false,
        contentType: pdfToBeUploaded.mimeType
      })
      .then(() => {
        const pdfUrl = `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${pdfFileName}?alt=media`

        return db
          .doc(`/users/${req.body.currentUser.username}`)
          .update({
            resumeUrl: pdfUrl
          })
          .then(() => {
            return res.status(201).json({
              message: "Resume uploaded successfully."
            })
          })
          .catch(err => {
            console.log(`[UPLOAD RESUME] Error - ${err}`)
            return res.status(500).json({
              error: {
                message: 'Something went wrong!'
              }
            })
          })
      })
  })
  busboy.end(req.rawBody)
}