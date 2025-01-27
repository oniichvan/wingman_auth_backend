const admin = require('firebase-admin');
const serviceAccount = process.env.NODE_ENV === 'production'
  ? '/etc/secrets/firebase_service_account_new.json' // Render
  : './config/firebase_service_account_new.json'; // Local

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
