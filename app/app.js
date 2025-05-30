const express = require('express');
const { setupMiddleware, setupViewEngine, setupRoutes, setupErrorHandling, setupApplicationInsights, startServer} = require('./utils/serverUtils');

const app = express();
const port = process.env.PORT || process.env.SERVER_PORT || 3000;

// Application initialization
function initApp() {
    setupMiddleware(app);
    setupViewEngine(app);
    setupRoutes(app);
    setupErrorHandling(app);
    setupApplicationInsights();
    startServer(app, port);
}

// Start the application
initApp();