require('dotenv').config();
import app from './server';
import client from "./db/connect";

const PORT = process.env.PORT || 3000;


try {
    if (client) app.listen(PORT, ()=> console.log(`Server is listening on port ${PORT}...`));
  
  } catch (err) {
    console.error(err)
  }