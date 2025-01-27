const { JWT } = require("google-auth-library");
const fs = require("fs");

// Path to your service account key file
const SERVICE_ACCOUNT_FILE = "./config/firebaseServiceAccount.json";

// Load the service account key from the JSON file
const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, "utf-8"));

// Define the required scope for Firebase Cloud Messaging
const SCOPES = ["https://www.googleapis.com/auth/firebase.messaging"];

// Create a JWT client with the service account credentials
const client = new JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: SCOPES,
});

// Function to get the access token
const getAccessToken = async () => {
    try {
        const tokens = await client.authorize();
        console.log("Access Token:", tokens.access_token);
        return tokens.access_token;
    } catch (error) {
        console.error("Error obtaining access token:", error);
        throw new Error("Unable to obtain FCM access token.");
    }
};

module.exports = { getAccessToken };
