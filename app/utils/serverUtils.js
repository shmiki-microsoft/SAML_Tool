const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const logger = require('./logger');
const appInsights = require("applicationinsights");
const APP_ROOT = path.join(__dirname, "../");

function setupMiddleware(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.use(express.static( path.join(APP_ROOT, 'public')));
    app.use(compression());
    app.use(helmet());
}

function setupViewEngine(app) {
    app.set('view engine', 'ejs');
    app.set('views', path.join(APP_ROOT, 'views'));
}

function setupRoutes(app) {
    const indexRouter = require(path.join(APP_ROOT, 'routes/index'));
    const generateSamlRequest = require(path.join(APP_ROOT, 'routes/generateSamlRequest'));
    const generateAdvancedSamlRequest = require(path.join(APP_ROOT, 'routes/generateAdvancedSamlRequest'));
    const acsRouter = require(path.join(APP_ROOT, 'routes/acs'));
    const decodeSamlResponse = require(path.join(APP_ROOT, 'routes/decodeSamlResponse'));
    const generateSamlLogoutRequest = require(path.join(APP_ROOT, 'routes/generateSamlLogoutRequest'));

    app.use('/', indexRouter);
    app.use('/', generateSamlRequest);
    app.use('/', generateAdvancedSamlRequest);
    app.use('/', decodeSamlResponse);
    app.use('/', acsRouter);
    app.use('/', generateSamlLogoutRequest);

    app.use((req, res, next) => {
        res.status(404).render('notFound');
        logger.info('404 Not Found - URL:', req.originalUrl);
    });
}

function setupErrorHandling() {
    process.on('uncaughtException', function(err) {
        logger.error('Uncaught Exception:', err);
    });

    process.on('unhandledRejection', function(reason, promise) {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });
}

function setupApplicationInsights() {
    appInsights.setup().start();
}

function startServer(app, port) {
    app.listen(port, () => {
        logger.info(`SAML_Request_Builder listening on port ${port}`);
        console.log(`SAML_Request_Builder listening on port ${port}`);
    });
}

module.exports = {
    setupMiddleware,
    setupViewEngine,
    setupRoutes,
    setupErrorHandling,
    setupApplicationInsights,
    startServer
};