require('dotenv').config();

const express = require('express');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const jwt = require('jsonwebtoken');
const app = express();

async function initializeFirebase() {
    try {
        initializeApp({
            credential: cert({
                type: process.env.FIREBASE_TYPE,
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: process.env.FIREBASE_AUTH_URI,
                token_uri: process.env.FIREBASE_TOKEN_URI,
                auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
                client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
                universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
            }),
            connectTimeout: 7000
        });
    } catch (error) {
        throw error;
    }
}

async function startServer() {
    await initializeFirebase();
    const db = getFirestore();
    const app = express();
    function generateToken(req, res, next) {
        const user = { id: process.env.USER_ID, username: process.env.USERNAME };
        const token = jwt.sign(user, process.env.SECRET_KEY);

        req.token = token;
        next();
    }

    app.use(generateToken);

    const appRoutes = require('./app');
    app.use('/api', appRoutes);

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).send(`Something went wrong: ${err.message}`);
    });

    app.use((req, res, next) => {
        res.status(404).send("Not found");
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => {

    });
}

startServer();
