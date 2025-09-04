import express from "express";
import dotenv from 'dotenv';
dotenv.config();
const app = express();
const port = process.env.PORT;
app.post("/create-link", (req, res) => {
});
app.listen(port, () => {
    console.log(`Listen on port ${port}`);
});
