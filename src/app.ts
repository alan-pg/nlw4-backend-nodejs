import "reflect-metadata";
import express, { json } from "express";

import createConnection from "./database";
import { router } from "./routes";

createConnection();
const app = express();

app.use(express.json());
app.use(router);

app.get("/teste", (req, res) => {
  res.json({ res: "opaa" });
});

export { app };
