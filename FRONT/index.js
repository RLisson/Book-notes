import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 4000;

// Backend URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Get all evaluations from backend
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/`);
        const avaliations = response.data;
        res.render("index.ejs", { avaliations: avaliations });
    } catch (error) {
        console.error('Error fetching evaluations:', error);
        res.render("index.ejs", { avaliations: [] });
    }
});

// Render add page
app.get('/add', (req, res) => {
    res.render("add.ejs");
});

// Handle form submission for new book evaluation
app.post('/add', async (req, res) => {
    try {
        const { title, author, note, avaliation, book_cover } = req.body;
        
        const response = await axios.post(`${BACKEND_URL}/add`, {
            title,
            author, 
            note: parseInt(note),
            avaliation,
            book_cover
        });
        
        res.redirect('/');
    } catch (error) {
        console.error('Error adding book evaluation:', error.message);
        if (error.response) {
            console.error('Backend error response:', error.response.data);
        }
        res.redirect('/add?error=true');
    }
});

// Proxy endpoint for book search (used by the frontend JS)
app.get('/search', async (req, res) => {
    try {
        const { title } = req.query;
        const response = await axios.get(`${BACKEND_URL}/api/search`, {
            params: { title }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({ error: 'Error searching books' });
    }
});

app.get('/avaliations/:id', async (req, res) => {
    const bookId = req.params.id;
    try {
        const response = await axios.get(`${BACKEND_URL}/${bookId}`);
        const avaliation = response.data;
        res.render("avaliation.ejs", { avaliation });
    } catch (error) {
        console.error('Error fetching book evaluation:', error);
        res.status(500).send('Error fetching book evaluation');
    }
});

// Handle book evaluation deletion
app.post('/delete/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        await axios.delete(`${BACKEND_URL}/delete/${bookId}`);
        res.redirect('/');
    } catch (error) {
        console.error('Error deleting book evaluation:', error);
        res.redirect(`/avaliations/${req.params.id}?error=delete_failed`);
    }
});

app.get('/edit/:id', async (req, res) => {
    const bookId = req.params.id;
    try {
        const response = await axios.get(`${BACKEND_URL}/${bookId}`);
        const avaliation = response.data;
        res.render("edit.ejs", { avaliation });
    } catch (error) {
        console.error('Error fetching book evaluation for edit:', error);
        res.status(500).send('Error fetching book evaluation for edit');
    }
});

// Handle book evaluation update
app.post('/edit/:id', async (req, res) => {
    try {
        const bookId = req.params.id;
        const { note, avaliation } = req.body;
        await axios.patch(`${BACKEND_URL}/update/${bookId}`, {
            note,
            avaliation
        });
        res.redirect(`/avaliations/${bookId}`);
    } catch (error) {
        console.error('Error updating book evaluation:', error);
        res.redirect(`/edit/${req.params.id}?error=update_failed`);
    }
});

app.listen(port, () => {
    console.log(`Frontend server is running on http://localhost:${port}`);
});