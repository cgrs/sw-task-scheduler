const functions = require('firebase-functions'),
    admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.sendNotification = functions.https.onCall((data, context) => {
    admin.messaging().send({
        data: data.message || undefined,
        notification: data.notification,
        token: data.token
    }).then(messageID => console.log('message ', messageID, 'sent'))
    .catch(() => {throw new functions.https.HttpsError('unknown')})
})
