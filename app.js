const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/taskdb')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const TaskSchema = new mongoose.Schema({
    task: String
});

const Task = mongoose.model('Task', TaskSchema);

app.get('/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post('/tasks', async (req, res) => {
    try {
        const newTask = new Task({
            task: req.body.task
        });

        await newTask.save();

        res.json(newTask);
    } catch (err) {
        console.log(err);
    }
});
app.delete('/tasks/:id', async (req, res) => {

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: "Task Deleted" });

});
app.put('/tasks/:id', async (req, res) => {

    await Task.findByIdAndUpdate(
        req.params.id,
        { task: req.body.task }
    );

    res.json({ message: "Task Updated" });

});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});