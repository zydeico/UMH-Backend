# Backend for the project
This is the backend for the project. It is a RESTful API that is built using Node.js and Express.js. It is connected to a Firebase database.

## Installation
To install the backend you need to clone the repository and then run the following commands:
```bash
cd umh-backend
npm install
```
Then you can run the server with the following command:
```bash
npm run dev
```
You need to have a .env file with the following variables:
```bash
// JWT Authentication
USERNAME
SECRET_KEY
USER_ID

// Firebase cofiguration
FIREBASE_TYPE
FIREBASE_PROJECT_ID
FIREBASE_PRIVATE_KEY_ID
FIREBASE_PRIVATE_KEY
FIREBASE_CLIENT_EMAIL
FIREBASE_CLIENT_ID
FIREBASE_AUTH_URI
FIREBASE_TOKEN_URI
FIREBASE_AUTH_PROVIDER_X509_CERT_URL
FIREBASE_CLIENT_X509_CERT_URL
FIREBASE_UNIVERSE_DOMAIN
OCMP_SUBSCRIPTION_KEY
```

PLEASE, REMOVE THE // FROM THE .ENV FILE, THIS IS JUST FOR THE README
In order to get all the firebase configuration you need to create a new project in firebase and then go to the settings of the project and then to the service accounts tab, there you can generate a new private key and you will get a json file with all the configuration.

## Deployment
The backend is deployed in Railway. The deployment is automatically done with Railway CLI using the following command:
```bash
railway up
```

## Deployment in Google Cloud Run
The backend is deployed in Google Cloud Run. The deployment is automatically done with the following command:
```bash
gcloud run deploy umhbackend --source .
```
Note: Use the server 33 region us-east1 to deploy the backend.

Youu need to have the environment variables in Railway.