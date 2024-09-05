const express = require('express');
const { format } = require('date-fns');
const Todo = require('../models/Todo');
const router = express.Router();

const validateRequest = (todoData) => {
  const { category, priority, status, dueDate } = todoData;

  if (!['WORK', 'HOME', 'LEARNING'].includes(category)) {
    return 'Invalid Todo Category';
  }
  if (!['HIGH', 'MEDIUM', 'LOW'].includes(priority)) {
    return 'Invalid Todo Priority';
  }
  if (!['TO DO', 'IN PROGRESS', 'DONE'].includes(status)) {
    return 'Invalid Todo Status';
  }
  if (isNaN(new Date(dueDate))) {
    return 'Invalid Due Date';
  }

  return null;
};

// GET /todos/
router.get('/', async (req, res) => {
  try {
    const { status, priority, category, search_q, dueDate } = req.query;

    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;
    if (search_q) query.todo = new RegExp(search_q, 'i');
    if (dueDate) query.dueDate = format(new Date(dueDate), 'yyyy-MM-dd');

    const todos = await Todo.find(query);
    res.json(todos);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// GET /todos/:todoId/
router.get('/:todoId', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.todoId);
    if (!todo) return res.status(404).send('Todo not found');
    res.json(todo);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// GET /agenda/
router.get('/agenda', async (req, res) => {
  try {
    const { date } = req.query;
    const todos = await Todo.find({
      dueDate: format(new Date(date), 'yyyy-MM-dd'),
    });
    res.json(todos);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// POST /todos/
router.post('/', async (req, res) => {
  try {
    const { id, todo, category, priority, status, dueDate } = req.body;

    const validationError = validateRequest({ category, priority, status, dueDate });
    if (validationError) {
      return res.status(400).send(validationError);
    }

    const newTodo = new Todo({
      todo,
      category,
      priority,
      status,
      dueDate: format(new Date(dueDate), 'yyyy-MM-dd'),
    });

    await newTodo.save();
    res.status(201).send('Todo Successfully Added');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// PUT /todos/:todoId/
router.put('/:todoId', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.todoId);
    if (!todo) return res.status(404).send('Todo not found');

    const updates = req.body;

    const validationError = validateRequest({ ...todo.toObject(), ...updates });
    if (validationError) {
      return res.status(400).send(validationError);
    }

    Object.keys(updates).forEach((key) => {
      todo[key] = key === 'dueDate' ? format(new Date(updates[key]), 'yyyy-MM-dd') : updates[key];
    });

    await todo.save();
    res.send(`${Object.keys(updates)[0]} Updated`);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// DELETE /todos/:todoId/
router.delete('/:todoId', async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.todoId);
    if (!todo) return res.status(404).send('Todo not found');

    await todo.remove();
    res.send('Todo Deleted');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
