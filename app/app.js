// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const logger = require('./utils/logger'); 

const app = express();
const port = process.env.PORT || process.env.SERVER_PORT;

// Middleware
function setupMiddleware(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(compression());
}
// Set up EJS
function setupViewEngine(app) {
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
}
// Set Headers
function setupHeaders(app) {
    app.use((req, res, next) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self';");
        next();
    });
}

// Routes
function setupRoutes(app) {
    const indexRouter = require('./routes/index');
    const sendSAMLRequestRouter = require('./routes/send_saml_request');
    const acsRouter = require('./routes/acs');
    const samlResponseDecodeRouter = require('./routes/saml_response_decode');
    const samlRequestEncodeRouter = require('./routes/send_saml_request_advanced');
    
    app.use('/', indexRouter);
    app.use('/', sendSAMLRequestRouter);
    app.use('/', acsRouter);
    app.use('/', samlResponseDecodeRouter);
    app.use('/', samlRequestEncodeRouter);
    
    app.use((req, res, next) => {
        res.status(404).render('not_found');
        logger.info('404 Not Found - URL:', req.originalUrl);
    });
}
// Exception
function setupErrorHandling() {
    process.on('uncaughtException', function(err) {
        logger.error('Uncaught Exception:', err);
    });
}

// Start app server to listen on set port
function startServer(app, port) {
    app.listen(port, () => {
        logger.info(`saml2-js Sample app listening on port ${port}`);
        console.log(`saml2-js Sample app listening on port ${port}`);
    });
}

// Application initialization
function initApp() {
    setupMiddleware(app);
    setupViewEngine(app);
    setupHeaders(app);
    setupRoutes(app);
    setupErrorHandling();
    startServer(app, port);
}

// Start the application
initApp();