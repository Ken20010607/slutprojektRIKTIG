const express = require("express");
const app = express();
const myModule = require('./myModule.js');
const bcrypt = require('bcryptjs')
const io = require('socket.io')(3000)
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose');

// DB Config
const db = require('./config/keys').MongoURI;

// Connect to mongo
mongoose.connect("mongodb+srv://ken0607:ken@cluster0-aw8ro.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true,  useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));


// EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '\\views\\')
app.set("layout","layout")
app.use(expressLayouts);

app.get('/chat', (req, res) => {
    res.render('chat', ) 
});

// Bodyparser
app.use(express.urlencoded({ extended: false }));



// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'))

app.use(express.json())

const port = 6969;
const host = 'localhost';
const clientDir = __dirname + "\\client\\";
const users = myModule.getDataFromDb('', 'Ken', 'users')

io.on('connection', socket => {
    socket.on('new-user', name => {
        users[socket.id] = name
        socket.broadcast.emit('user-connected', name)
    })
    socket.on('send-chat-message', message => {
        socket.broadcast.emit('chat-message', { message: message, name: users[socket.id] })
    })
    socket.on('disconnect', () => {
        socket.broadcast.emit('user-disconnected', users[socket.id])
        delete users[socket.id]
    })
})

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', async(req, res) => {

    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { name: req.body.name, password: hashedPassword}
        myModule.updateUserDb(user, 'Ken', 'users')
        res.status(201).send()
    } catch {
        res.status(500).send()
    }
    
    
})

app.post('/users/login', async (req, res) => {
    const user = users.find(user => user.name === req.body.name)
    if (user == null){
        return res.status(400).send('Cannot find the user')
    }
    try {
        if (await bcrypt.compare(req.body.password,user.password)) {
            res.send('Success!')
        } else {
            res.send('Not Allowed!')
        }
    } catch {
        res.status(500).send()
    }
})

app.get("/", (request, response) => response.sendFile(clientDir+"index.html"));
app.get("/style", (request, response) => response.sendFile(clientDir+"style.css"));
app.get("/script.js", (request, response) => response.sendFile(clientDir+"script.js"));
app.get("/kik.jpg", (request, response) => response.sendFile(clientDir+"kik.jpg"));



app.listen(port,host, function f() {
    console.log(`listening att http://${ host}:${port}`);
}); 