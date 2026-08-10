'use strict';

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vizor — ClickGuard AI API',
      version: '1.0.0',
      description: 'Enterprise Click Fraud & Bot Detection Platform API',
      contact: { name: 'Vizor Team', email: 'api@vizor.io' }
    },
    servers: [
      { url: `http://localhost:${process.env.PORT || 4000}`, description: 'Development' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        apiKey: { type: 'apiKey', in: 'header', name: 'X-API-Key' }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJsdoc(options);
