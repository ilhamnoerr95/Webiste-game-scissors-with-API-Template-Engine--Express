if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express');
const expressLayout = require("express-ejs-layouts");
const app = express();
const fs = require('fs')
const chalk = require("chalk");
const bcrypt = require('bcrypt')
const flash = require("express-flash")
const session = require("express-session")
const passport = require('passport')
const port = 5000;

const users = []

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id =>  users.find(user => user.id === id),
)




//bodyparser
app.use(express.urlencoded({extended: false}));
app.use(express.json())
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())



//static files
app.use(express.static('public'))
app.use('/css',express.static(__dirname +'public/css'))
app.use('/img',express.static(__dirname +'public/img'))
app.use('/js',express.static(__dirname +'public/js'))


app.use(expressLayout);
//template view engine
app.set("layout", "./layouts/masterhomepage.ejs")
app.set("views", "./views")
app.set('view engine', 'ejs');


app.get('/', (req,res)=>{
    res.render('home')
})

app.get('/games', (req,res)=>{
    let status = req.query.notif
    res.render('games')
})

app.get('/login', (req,res)=>{
    res.render('login')
})

app.post('/login', passport.authenticate('local' ,{
    successRedirect:'/games',
    failureRedirect: '/login',
    failureFlash: true
    // let data = JSON.parse(fs.readFileSync(__dirname + '/data/user.json'))
    // const {email,password} = req.body; 
    // res.redirect("/games?notif=welcomeilham")
}))



app.get('/signup', (req,res)=>{
    res.render('register')
})

app.post('/signup', async (req,res)=>{
    // let data = JSON.parse(fs.readFileSync(__dirname + '/data/user.json'))
    // const {email,password} = req.body; 
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect('/login')
    } catch{
        res.redirect('/signup')
    }
    console.log(users);
    // res.redirect("/games?notif=welcomeilham")
})


app.listen(port, ()=>{
    console.log(chalk.keyword('orange')("Server On"))
})

