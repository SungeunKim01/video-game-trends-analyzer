import express from 'express';
import { router as salesRouter } from "./routers/sales.js";

const app = express();

//parse json for all routes -cp from Yan Chi's code in app.js
app.use(express.json());

//static files-cp from Yan Chi's code in app.js
app.use(express.static('../client/dist'));

// api routes
app.use("/sales", salesRouter);

//default 404 page -cp from Yan Chi's code in app.js
app.use((req, res) =>{
  res.status(404).send('Page not found');
});

export default app;
