const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/taskdb')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Schema
const TaskSchema = new mongoose.Schema({
    task: String
});

const Task = mongoose.model('Task', TaskSchema);

// Home Route
app.get('/', (req, res) => {
    res.send("Backend Working");
});

// Get All Tasks
app.get('/tasks', async (req, res) => {
    try {

        const tasks = await Task.find();

        res.json(tasks);

    } catch (error) {

        console.log(error);

        res.status(500).send("Error fetching tasks");
    }
});

// Add Task
app.post('/add', async (req, res) => {
    try {

        const newTask = new Task({
            task: req.body.task
        });

        await newTask.save();

        res.send("Task Added");

    } catch (error) {

        console.log(error);

        res.status(500).send("Error adding task");
    }
});

// Delete Task
app.delete('/delete/:id', async (req, res) => {
    try {

        await Task.findByIdAndDelete(req.params.id);

        res.send("Task Deleted");

    } catch (error) {

        console.log(error);

        res.status(500).send("Error deleting task");
    }
});

// Update Task
app.put('/update/:id', async (req, res) => {
    try {

        await Task.findByIdAndUpdate(
            req.params.id,
            {
                task: req.body.task
            }
        );

        res.send("Task Updated");

    } catch (error) {

        console.log(error);

        res.status(500).send("Error updating task");
    }
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on port 3000");
});