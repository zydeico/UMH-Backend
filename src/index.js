require('dotenv').config();

const express = require('express');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const jwt = require('jsonwebtoken');
const requestLog = {};
const REQUEST_LIMIT = 150;
const INTERVAL_TIME = 60000;

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

async function saveBlockedIP(req) {
    try {
        const db = getFirestore();
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const blockedIPCollectionRef = db.collection(process.env.BLOCKEDIPCOLLECTIONNAME);
        await blockedIPCollectionRef.doc(ip).set({ timestamp: new Date() });
    } catch (error) {
        console.error("Error saving blocked IP:", error);
        throw error;
    }
}

async function startServer() {
    try {
        await initializeFirebase();
        const db = getFirestore();
        const app = express();
        function generateToken(req, res, next) {
            const user = { id: process.env.USER_ID, username: process.env.USERNAME };
            const token = jwt.sign(user, process.env.SECRET_KEY);

            req.token = token;
            next();
        }

        app.use((req, res, next) => {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            if (!requestLog[ip]) {
                requestLog[ip] = [];
            }
            const currentTime = Date.now();
            const requestsInWindow = requestLog[ip].filter(time => currentTime - time < INTERVAL_TIME);
            if (requestsInWindow.length > REQUEST_LIMIT) {
                saveBlockedIP(req);
                return res.status(429).json({ error: 'Too many requests from this IP' });
            }
            requestLog[ip].push(currentTime);
            next();
        });

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

        const port = process.env.PORT || 8080;
        app.listen(port, () => { });
    } catch (error) {
        console.error("Error starting server:", error);
        throw error;
    }
}

startServer();
