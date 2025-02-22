import admin from "firebase-admin";

const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_KEY, "base64").toString("utf8"));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export default admin;