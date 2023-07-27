import { config } from "dotenv";
config();
import * as indexRouter from "./modules/index.router.js";
import { connectDB } from "./DB/connect.js";
import express from "express";
const app = express();
const port = process.env.port;
const baseUrl = process.env.BASEURL;
app.use(express.json());
// app.use(`${baseUrl}/upload`,  express.static('./upload'))
app.use(`${baseUrl}/auth`, indexRouter.authRouter);
app.use(`${baseUrl}/user`, indexRouter.userRouter);
app.use(`${baseUrl}/post`, indexRouter.postRouter);

app.use("*", (req, res) => res.status(404).send("In-valid Routing"));

connectDB();
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
