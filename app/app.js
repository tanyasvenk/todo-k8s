const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/todosdb';

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB', mongoUri))
  .catch(err => console.error('MongoDB connection error', err));

const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
}, { timestamps: true });

const Todo = mongoose.model('Todo', todoSchema);

app.get('/todos', async (req, res) => {
  const todos = await Todo.find().sort({ createdAt: -1 });
  res.json(todos);
});

app.post('/todos', async (req, res) => {
  const { title, completed } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const todo = new Todo({ title, completed });
  await todo.save();
  res.status(201).json(todo);
});

app.get('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ error: 'not found' });
    res.json(todo);
  } catch (e) { res.status(400).json({ error: 'invalid id' }); }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!todo) return res.status(404).json({ error: 'not found' });
    res.json(todo);
  } catch (e) { res.status(400).json({ error: 'invalid id' }); }
});

app.delete('/todos/:id', async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: 'not found' });
    res.json({ success: true });
  } catch (e) { res.status(400).json({ error: 'invalid id' }); }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Todo app listening on ${port}`));
