import express from 'express';
import { router as salesRouter } from './routers/sales.js';
import { router as trendsRouter } from './routers/trends.js';
const app = express();

//Routes are here either directly or using a router

//parse json for all routes
app.use(express.json());

//static files
app.use(express.static('../client/dist'));

// api routes
app.use('/api/sales', salesRouter);

app.use('/api/trends', trendsRouter);

//default 404 page
app.use((req, res) =>{
  res.status(404).send('Page not found');
});

export default app;
