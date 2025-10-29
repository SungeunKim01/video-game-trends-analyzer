import express from 'express';
import { router as salesRouter } from './routers/sales.js';
const app = express();

//Routes are here either directly or using a router

//parse json for all routes
app.use(express.json());

//static files
app.use(express.static('../client/dist'));

// api routes
app.use('/api/sales', salesRouter);

//default 404 page
app.use((req, res) =>{
  res.status(404).send('Page not found');
});

export default app;
