import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';

const app = express();
const port = process.env.PORT;
const BACKEND_URL = process.env.BACKEND_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

let avaliationList = [];

async function getAvaliations() {
    const response = await axios.get(`${BACKEND_URL}/`);
    avaliationList = response.data;
}

app.get('/', async (req, res) => {
    await getAvaliations();
    console.log(avaliationList);
    res.render("index.ejs", { avaliations: avaliationList });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});