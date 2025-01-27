const admin = require('firebase-admin');
const serviceAccount = require('./firebase_service_account_new.json'); 

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
