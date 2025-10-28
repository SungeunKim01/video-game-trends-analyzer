import express from 'express';
const app = express();

//Routes are here either directly or using a router

//parse json for all routes
app.use(express.json());

//static files
app.use(express.static('../client/dist'));

//default 404 page
app.use((req, res) =>{
  res.status(404).send('Page not found');
});

export default app;
