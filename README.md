# User Authentication API Documentation
This documentation describes the APIs related to user registration, OTP verification, authentication, and updates on Firebase token and device ID.

## 1. Register User
**Endpoint:** POST https://wingman-auth-backend.onrender.com/api/auth/register <br>
**Description:** Registers a new user in the system. <br>
**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "countryCode": "+91",
  "email": "example@gmail.com",
  "deviceId": "abcd1234efgh5678",
  "firebaseToken": "firebaseTokenSample12345",
  "timestamp": "2025-01-13T10:00:00Z"
}

```
**Response:**
```json
{
    "message": "User registered successfully",
    "user": {
        "mobileNumber": "9876543210",
        "countryCode": "+91",
        "email": "example@gmail.com",
        "deviceId": "abcd1234efgh5678",
        "firebaseToken": "firebaseTokenSample12345",
        "timestamp": "2025-01-13T10:00:00.000Z",
        "isVerified": false,
        "isAuthenticate": false,
        "_id": "6784c48ba34880536c5a8bb8",
        "createdAt": "2025-01-13T07:45:15.870Z",
        "updatedAt": "2025-01-13T07:45:15.870Z",
        "__v": 0
    }
}
```

## 2. Send OTP
**Endpoint:** POST https://wingman-auth-backend.onrender.com/api/auth/send-otp <br>
**Description:** Sends an OTP to a registered mobile number. <br>
**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "countryCode": "+91",
  "deviceId": "abcd1234efgh5678"
}

```
**Response:**
```json
{
    "message": "OTP sent successfully.",
    "otp": "9999"
}
```

## 3. Verify OTP
**Endpoint:** POST https://wingman-auth-backend.onrender.com/api/auth/verify-otp <br>
**Description:** Verifies the OTP sent to the mobile number. <br>
**Request Body:**
```json
{
  "mobileNumber": "9876543210",
  "otp": "9999",
  "firebaseToken": "firebaseTokenSample12345"
}

```
**Response:**
```json
{
    "message": "OTP verified successfully.",
    "user": {
        "_id": "6784c48ba34880536c5a8bb8",
        "mobileNumber": "9876543210",
        "countryCode": "+91",
        "email": "example@gmail.com",
        "deviceId": "abcd1234efgh5678",
        "firebaseToken": "firebaseTokenSample12345",
        "timestamp": "2025-01-13T10:00:00.000Z",
        "isVerified": true,
        "isAuthenticate": false,
        "createdAt": "2025-01-13T07:45:15.870Z",
        "updatedAt": "2025-01-13T07:47:33.363Z",
        "__v": 0,
        "otp": null,
        "otpExpiration": "2025-01-13T07:48:00.495Z"
    }
}
```
- If the OTP is not entered within 30 seconds it gives 'time out'

## 4. Device login confirmation
**Endpoint:** POST https://wingman-auth-backend.onrender.com/api/auth/authenticate <br>
**Description:** On logging into a device it asks the user to authorize by YES/NO <br>
**Request Body:**
```json
{
    "mobileNumber": "9876543210",
    "deviceId": "abcd1234efgh5678",
    "isAuthenticated": true
}

```
**Response:**
```json
{
    "message": "Logged in successfully.",
    "user": {
        "_id": "6784c48ba34880536c5a8bb8",
        "mobileNumber": "9876543210",
        "countryCode": "+91",
        "email": "example@gmail.com",
        "deviceId": "abcd1234efgh5678",
        "firebaseToken": "firebaseTokenSample12345",
        "timestamp": "2025-01-13T10:00:00.000Z",
        "isVerified": true,
        "isAuthenticate": true,
        "createdAt": "2025-01-13T07:45:15.870Z",
        "updatedAt": "2025-01-13T07:50:08.220Z",
        "__v": 0,
        "otp": null,
        "otpExpiration": "2025-01-13T07:48:56.658Z"
    }
}
```
- If the users says 'No'<br>
**Request Body:**
```json
{
    "mobileNumber": "9876543210",
    "deviceId": "abcd1234efgh5678",
    "isAuthenticated": false
}
```
Respones: 
```json
{
    "message": "Authentication failed. Please try again.",
    "user": {
        "_id": "6784c48ba34880536c5a8bb8",
        "mobileNumber": "9876543210",
        "countryCode": "+91",
        "email": "example@gmail.com",
        "deviceId": "abcd1234efgh5678",
        "firebaseToken": "firebaseTokenSample12345",
        "timestamp": "2025-01-13T10:00:00.000Z",
        "isVerified": true,
        "isAuthenticate": false,
        "createdAt": "2025-01-13T07:45:15.870Z",
        "updatedAt": "2025-01-13T07:50:41.652Z",
        "__v": 0,
        "otp": null,
        "otpExpiration": "2025-01-13T07:48:56.658Z"
    }
}
```

## 5. Update Firebase Token
**Endpoint:** POST https://wingman-auth-backend.onrender.com/api/auth/update-token <br>
**Description:** Updates the Firebase token for a user. <br>
**Request Body:**
```json
{
    "deviceId": "abcd1234efgh5678",
    "oldFirebaseToken": "firebaseTokenSample12345",
    "newFirebaseToken": "new_token_value_here"
}
```
**Response:**
```json
{
    "message": "Firebase token updated successfully.",
    "user": {
        "_id": "6784c48ba34880536c5a8bb8",
        "mobileNumber": "9876543210",
        "countryCode": "+91",
        "email": "example@gmail.com",
        "deviceId": "abcd1234efgh5678",
        "firebaseToken": "new_token_value_here",
        "timestamp": "2025-01-13T10:00:00.000Z",
        "isVerified": true,
        "isAuthenticate": false,
        "createdAt": "2025-01-13T07:45:15.870Z",
        "updatedAt": "2025-01-13T07:55:42.348Z",
        "__v": 0,
        "otp": null,
        "otpExpiration": "2025-01-13T07:48:56.658Z"
    }
}
```

## 6. Update Device ID and Firebase Token
**Endpoint:** POST https://wingman-auth-backend.onrender.com/api/auth/update-device-token <br>
**Description:**  Updates the device ID and Firebase token for the user when the user logs in from a different device <br>
**Request Body:**
```json
{
    "mobileNumber": "9876543210",
    "newDeviceId": "new-device-id-123",
    "newFirebaseToken": "new-firebase-token-abc"
}
```
**Response:**
```json
{
    "message": "Device ID and Firebase token updated successfully.",
    "user": {
        "_id": "6784c48ba34880536c5a8bb8",
        "mobileNumber": "9876543210",
        "countryCode": "+91",
        "email": "example@gmail.com",
        "deviceId": "new-device-id-123",
        "firebaseToken": "new-firebase-token-abc",
        "timestamp": "2025-01-13T10:00:00.000Z",
        "isVerified": true,
        "isAuthenticate": false,
        "createdAt": "2025-01-13T07:45:15.870Z",
        "updatedAt": "2025-01-13T07:57:04.007Z",
        "__v": 0,
        "otp": null,
        "otpExpiration": "2025-01-13T07:48:56.658Z"
    }
}
```

## 7. Get All Users
**Endpoint:** GET https://wingman-auth-backend.onrender.com/api/auth/all-users <br>
**Description:**  Retrieves all registered users from the database. <br>
**Response:**
```json
[
  {
    /* User Object */
  }
]

```

## 7. Get User by Mobile Number
**Endpoint:** GET https://wingman-auth-backend.onrender.com/api/auth/user/:mobileNumber <br>
**Description:**  Fetch a user by their mobile number. <br>
**Response:**
```json
{
  /* User Object */
}
```

# Model of the user
```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    mobileNumber: { 
        type: String, 
        required: true 
    },
    countryCode: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        validate: {
            validator: function(v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid email!`
        },
        required: false
    },
    deviceId: { 
        type: String, 
        required: true, 
        unique: true 
    },
    firebaseToken: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        required: true 
    },
    otp: { 
        type: String 
    },
    otpExpiration: { 
        type: Date 
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isAuthenticate: {  // Added isAuthenticate field
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
```
