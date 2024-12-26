const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())

// MongoDB connection URI
const uri = "mongodb://localhost:27017"
const client = new MongoClient(uri)

// Database and collection
const dbName = 'bookStore'
const collectionName = 'allBooks'

// Connect to MongoDB
client.connect()
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB", err))

const db = client.db(dbName)
const booksCollection = db.collection(collectionName)

// Routes

// POST /books: Add a new book
app.post('/books', async (req, res) => {
    const { title, author, year } = req.body
    try {
        const result = await booksCollection.insertOne({ title, author, year })
        const insertedBook = await booksCollection.findOne({ _id: result.insertedId })
        res.status(201).json(insertedBook)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// GET /books: Get all books
app.get('/books', async (req, res) => {
    try {
        const books = await booksCollection.find().toArray()
        res.json(books)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// GET /books/:id: Get a book by ID
app.get('/books/:id', async (req, res) => {
    const { id } = req.params
    try {
        const book = await booksCollection.findOne({ _id: new ObjectId(id) })
        if (!book) {
            return res.status(404).json({ error: 'Book not found' })
        }
        res.json(book)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// PUT /books/:id: Update a book by ID
app.put('/books/:id', async (req, res) => {
    const { id } = req.params
    const { title, author, year } = req.body
    try {
        const result = await booksCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: { title, author, year } }
        )
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Book not found' })
        }
        res.json({ message: 'Book updated successfully' })
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
})

// DELETE /books/:id: Delete a book by ID
app.delete('/books/:id', async (req, res) => {
    const { id } = req.params
    try {
        const result = await booksCollection.deleteOne({ _id: new ObjectId(id) })
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Book not found' })
        }
        res.json({ message: 'Book deleted successfully' })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Start server
const PORT = 5000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})


// Testing using Postman

// 1. Adding a New Book
// POST http://localhost:5000/books
// Body (raw JSON):
// {
//     "title": "The Catcher in the Rye",
//     "author": "J.D. Salinger",
//     "year": 1951
// }
// Expected Response:
// Status: 201 Created
// Body: 
// {
//     "_id": "ObjectId('60b0e0b0c65f2c1df8d1a6f0')",
//     "title": "The Catcher in the Rye",
//     "author": "J.D. Salinger",
//     "year": 1951
// }

// 2. Retrieves All Books in the Database
// GET http://localhost:5000/books
// Expected Response:
// Status: 200 OK
// Body:
// [
//     {
//         "_id": "ObjectId('60b0e0b0c65f2c1df8d1a6f0')",
//         "title": "The Catcher in the Rye",
//         "author": "J.D. Salinger",
//         "year": 1951
//     },
//     {
//         "_id": "ObjectId('60b0e0b0c65f2c1df8d1a6f1')",
//         "title": "1984",
//         "author": "George Orwell",
//         "year": 1949
//     }
// ]

// 3. Retrieves a Book by ID
// GET http://localhost:5000/books/{id}
// Example:
// GET http://localhost:5000/books/60b0e0b0c65f2c1df8d1a6f0
// Expected Response:
// Status: 200 OK
// Body:
// {
//     "_id": "ObjectId('60b0e0b0c65f2c1df8d1a6f0')",
//     "title": "The Catcher in the Rye",
//     "author": "J.D. Salinger",
//     "year": 1951
// }
// If the book is not found:
// Status: 404 No
