const express = require('express');
const rateLimit = require('express-rate-limit');
const app = express();
const routes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use(express.json());

// Configuración de trust proxy a false antes de express-rate-limit
app.set('trust proxy', false);

// Middleware para manejar errores
app.use(errorHandler);

/**
 * Middleware de limitación de velocidad
 */
const limiter = rateLimit({
    windowMs: 6 * 60 * 60 * 1000,
    max: 200,
    message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Rutas
app.use('/', routes);

module.exports = app;
