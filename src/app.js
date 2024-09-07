const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const routes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());

// Delete the x-forwarded-for header before express-rate-limit middleware
app.use((req, res, next) => {
    req.headers['x-forwarded-for'] = '';
    next();
});

// Configuration for the trust proxy
app.set('trust proxy', false);

// Error management middleware
app.use(errorHandler);

/**
 * Speed limiter middleware
 */
const limiter = rateLimit({
    windowMs: 6 * 60 * 60 * 1000,
    max: 999,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Routes
app.use('/', routes);

module.exports = app;
