const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/taskdb')
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const TaskSchema = new mongoose.Schema({

    task: String,

    status: {
        type: String,
        default: "Pending"
    },

    userId: String,

    priority: {
        type: String,
        default: "Medium"
    },

    deadline: String
});

const UserSchema = new mongoose.Schema({

    username: String,

    email: String,

    password: String
});

const Task = mongoose.model('Task', TaskSchema);

const User = mongoose.model('User', UserSchema);

app.get('/tasks/:userId', async (req, res) => {

    const tasks = await Task.find({

        userId: req.params.userId
    });

    res.json(tasks);
});

app.post('/tasks', async (req, res) => {

    try {

        const newTask = new Task({

            task: req.body.task,

            status: "Pending",

            userId: req.body.userId,

            priority: req.body.priority,

            deadline: req.body.deadline
        });

        await newTask.save();

        res.json(newTask);

    } catch(err) {

        console.log(err);
    }
});

app.delete('/tasks/:id', async (req, res) => {

    await Task.findByIdAndDelete(req.params.id);

    res.json({
        message: "Task Deleted"
    });
});

app.put('/tasks/status/:id', async (req, res) => {

    const task = await Task.findById(req.params.id);

    if(task.status === "Pending") {

        task.status = "In Progress";

    } else if(task.status === "In Progress") {

        task.status = "Completed";

    } else {

        task.status = "Pending";
    }

    await task.save();

    res.json(task);
});

app.put('/tasks/:id', async (req, res) => {

    await Task.findByIdAndUpdate(

        req.params.id,

        {
            task: req.body.task
        }
    );

    res.json({
        message: "Task Updated"
    });
});

app.post('/signup', async (req, res) => {

    try {

        const hashedPassword = await bcrypt.hash(

            req.body.password,

            10
        );

        const user = new User({

            username: req.body.username,

            email: req.body.email,

            password: hashedPassword
        });

        await user.save();

        res.json({
            message: "User Registered Successfully"
        });

    } catch(err) {

        console.log(err);
    }
});

app.post('/login', async (req, res) => {

    try {

        const user = await User.findOne({

            email: req.body.email
        });

        if(!user) {

            return res.json({
                message: "User Not Found"
            });
        }

        const isMatch = await bcrypt.compare(

            req.body.password,

            user.password
        );

        if(!isMatch) {

            return res.json({
                message: "Invalid Password"
            });
        }

        const token = jwt.sign(

            { id: user._id },

            "secretkey"
        );

        res.json({

            message: "Login Successful",

            token
        });

    } catch(err) {

        console.log(err);
    }
});

app.listen(5000, () => {

    console.log("Server running on port 5000");
});