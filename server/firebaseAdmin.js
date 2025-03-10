const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-key.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Export both admin and Firestore instance
const db = admin.firestore();
module.exports = { admin, db };