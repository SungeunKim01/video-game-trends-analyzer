import express from 'express';
import compression from 'compression';
import { router as salesRouter } from './routers/sales.js';
import { router as trendsRouter } from './routers/trends.js';

//-----swaggr
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Video Game Trends Analyzer API',
    version: '1.0.0',
    description: 'Docs generated from JSDoc in ./routers/*.js',
  },
  // api is mounted under /api, so set that as the base url
  servers: [{ url: 'http://localhost:3000/api' }],
};

//swagger jsdoc where to find the @swagger blocks
const options = {
  swaggerDefinition,
  apis: ['./routers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

const app = express();

// enable gzip compression for all responses - shrinks js, css, html, json over network
app.use(compression());

//Routes are here either directly or using a router

//parse json for all routes
app.use(express.json());

//static files
app.use(express.static('../client/dist'));

// mount Swagger ui and json befo routes
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));


// api routes
app.use('/api/sales', salesRouter);
app.use('/api/trends', trendsRouter);

//default 404 page
app.use((req, res) =>{
  res.status(404).send('Page not found');
});

export default app;
