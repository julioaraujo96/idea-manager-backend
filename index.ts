import * as dotenv from "dotenv";
import express from 'express';
import cors from 'cors';

import { userRouter } from "./src/routes/user.router";


dotenv.config();

if(!process.env.PORT){
    process.exit(1);
}

const PORT = process.env.PORT;

const app =  express();

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res)=>{
    res.send('Hello world!');
})

app.use('/api/users', userRouter);

app.listen(PORT, ()=> {
    console.log(`listening on port ${PORT}`);
});