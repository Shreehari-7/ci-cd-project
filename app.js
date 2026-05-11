// ==========================
// FULL UPDATED app.js
// ==========================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http');

const { Server } = require('socket.io');

const app = express();

const server = http.createServer(app);

const io = new Server(server, {

    cors: {
        origin: "*"
    }
});

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

    password: String,

    role: {

        type: String,

        default: "user"
    }
});

const Task = mongoose.model('Task', TaskSchema);

const User = mongoose.model('User', UserSchema);

function auth(req, res, next) {

    const token = req.headers.authorization;

    if(!token) {

        return res.status(401).json({

            message: "Access Denied"
        });
    }

    try {

        const verified = jwt.verify(

            token,

            "secretkey"
        );

        req.user = verified;

        next();

    } catch(err) {

        res.status(400).json({

            message: "Invalid Token"
        });
    }
}

function adminOnly(req, res, next) {

    if(req.user.role !== "admin") {

        return res.status(403).json({

            message: "Admin Access Only"
        });
    }

    next();
}

app.get('/tasks/:userId', auth, async (req, res) => {

    const tasks = await Task.find({

        userId: req.params.userId
    });

    res.json(tasks);
});

app.post('/tasks', auth, async (req, res) => {

    const newTask = new Task({

        task: req.body.task,

        status: "Pending",

        userId: req.body.userId,

        priority: req.body.priority,

        deadline: req.body.deadline
    });

    await newTask.save();

    io.emit('taskUpdated');

    res.json(newTask);
});

app.delete('/tasks/:id', auth, async (req, res) => {

    await Task.findByIdAndDelete(req.params.id);

    io.emit('taskUpdated');

    res.json({

        message: "Task Deleted"
    });
});

app.put('/tasks/status/:id', auth, async (req, res) => {

    const task = await Task.findById(req.params.id);

    if(task.status === "Pending") {

        task.status = "In Progress";

    } else if(task.status === "In Progress") {

        task.status = "Completed";

    } else {

        task.status = "Pending";
    }

    await task.save();

    io.emit('taskUpdated');

    res.json(task);
});

app.put('/tasks/:id', auth, async (req, res) => {

    await Task.findByIdAndUpdate(

        req.params.id,

        {

            task: req.body.task
        }
    );

    io.emit('taskUpdated');

    res.json({

        message: "Task Updated"
    });
});

app.post('/signup', async (req, res) => {

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
});

app.post('/login', async (req, res) => {

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

        {

            id: user._id,

            role: user.role
        },

        "secretkey"
    );

    res.json({

        message: "Login Successful",

        token
    });
});

app.get('/admin/users', auth, adminOnly, async (req, res) => {

    const users = await User.find();

    res.json(users);
});

app.get('/admin/tasks', auth, adminOnly, async (req, res) => {

    const tasks = await Task.find();

    res.json(tasks);
});

io.on('connection', (socket) => {

    console.log('User Connected');
});

server.listen(5000, () => {

    console.log("Server running on port 5000");
});