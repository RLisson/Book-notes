import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';
import pg from 'pg';

const app = express();
const port = process.env.PORT;

const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

// Config Db
const db = new pg.Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Search books by title on Google Books API
app.get('/search', async (req, res) => {
    const bookTitle = req.query.title;
    console.log(bookTitle);
    if (!bookTitle) {
        return res.status(400).json({ error: 'Title query parameter is required' });
    }
    try {
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: bookTitle,
                key: GOOGLE_BOOKS_API_KEY,
                startIndex: 0,
                maxResults: 10,
            }
        });

        // Extrair título, autores e imagem de cada livro
        console.log(response.data.items);
        const books = response.data.items?.map(item => ({
            title: item.volumeInfo.title,
            authors: item.volumeInfo.authors || ['Autor não informado'],
            thumbnail: item.volumeInfo.imageLinks?.thumbnail || null,
        })) || [];

        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Add a new book to the database
app.post("/add", async (req, res) => {
    const { title, note, avaliation, bookCover } = req.body;
    console.log(req.body);

    try {
        const result = await db.query(
            "INSERT INTO books (title, note, avaliation, book_cover) VALUES ($1, $2, $3, $4) RETURNING *",
            [title, note, avaliation, bookCover]
        );
        const newBook = result.rows[0];
        res.status(201).json(newBook);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all avaliations from database
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM books");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get avaliation by ID
app.get("/:id", async (req, res) => {
    const bookId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM books WHERE id = $1", [bookId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Avaliation not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update avaliation by ID
app.patch("/update/:id", async (req, res) => {
    const bookId = req.params.id;
    const { note, avaliation } = req.body;
    console.log(req.body);
    try {
        const result = await db.query(
            "UPDATE books SET note = $1, avaliation = $2 WHERE id = $3 RETURNING *",
            [note, avaliation, bookId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Avaliation not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete avaliation by ID
app.delete("/delete/:id", async (req, res) => {
    const bookId = req.params.id;
    try {
        const result = await db.query("DELETE FROM books WHERE id = $1 RETURNING *", [bookId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Avaliation not found' });
        }
        res.json({ message: 'Avaliation deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
