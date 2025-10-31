import express from 'express';
import type { Request, Response, Application } from 'express';
import auth_router from './routes/auth_routes.js';
import dotenv from "dotenv";
import { connect_db } from './database/db.js';
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import cors from 'cors';
import notes_router from './routes/notes_routes.js';
import path from 'path';
import { app, mainServer } from './socket/socketio.js';


dotenv.config()
const PORT = process.env.PORT || 8080;
const allowedOrigins = ["http://localhost:5173"];


connect_db();


app.use(cors({
  origin: allowedOrigins[0],
  credentials: true
}));
app.use("/uploads", express.static(path.resolve("uploads")));

app.use(express.json());
app.use(cookieParser(process.env.SIGNING_SECRET || "my-secret"));
app.use(morgan('dev'));


app.use('/api/auth', auth_router);
app.use('/api/notes', notes_router);


mainServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

