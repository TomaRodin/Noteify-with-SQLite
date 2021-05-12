var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const { v4: uuidv4 } = require('uuid');
var ejs = require('ejs');
var fs = require('fs');
var app = express();
var selectdb = require(__dirname + '/JS/selectdb.js')
var SelectById = require(__dirname + '/JS/SelectById.js')
var InsertNote = require(__dirname + '/JS/InsertNote.js')
var UpdateNote = require(__dirname + '/JS/UpdateNote.js')
var DeleteNote = require(__dirname + '/JS/DeleteNote.js')
var DeleteUser = require(__dirname + '/JS/DeleteUser.js')
var SelectUserById = require(__dirname + '/JS/SelectUserById.js')
var InsertUser = require(__dirname + '/JS/InsertUser.js')
var DeleteUserUnverify = require(__dirname + '/JS/DeleteUserUnverify.js')
var UpdatePassword = require(__dirname + '/JS/UpdatePassword.js')
var VerifyUser = require(__dirname + '/JS/VerifyUser.js')

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use(cookieParser())
app.set('view engine', 'ejs')

app.get('/', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.sendFile(__dirname + '/public/home.html')
    } else {
        res.redirect('/user')
    }
})

app.post('/login', function (req, res) {
    selectdb.getUser(req.body.user, function(user){
        
        console.log(user)
        if ( user === undefined ) {
            console.log('Does not exist')
        }

        
        else {
            
            if (user.active == "false") {
                console.log('Unverify')
            }
            else if (user.pass === req.body.pass) {
                console.log("Logged In")
                res.cookie('LoggedIn',user.name)
                res.send({redirect: true, url: '/user'});
                
              
            }
            else if (user.pass !== req.body.pass) {
                console.log('Wrong Password')
                res.send({ redirect: true, url: "/" })
            }
        }
    
    })

    
      
    

})


app.get('/register', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.sendFile(__dirname + '/public/register.html')
    } else {
        res.redirect('/')
    }
})

app.post('/register', function (req, res) {
    console.log(req.body.newuser)
    console.log(req.body.newpass)
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });

    db.all("SELECT * FROM users WHERE name ="+"'"+req.body.newuser+"'",function (err,rows){
        var row = rows[0];
        if (row === undefined) {
            db.all("SELECT * FROM users WHERE pass ="+"'"+req.body.newpass+"'",function (err,rows){
                console.log(rows)

                var row = rows[0];
                if (row == undefined) {
                        var uniqid = require('uniqid');
                        var id = uniqid()
                        db.run("INSERT INTO users (name,mail,pass,active_id,active ) VALUES ('"+ req.body.newuser +"','"+req.body.email+"','"+req.body.newpass+"','"+id+"','"+"false"+"')");
                        var nodemailer = require('nodemailer')
                            let transport = nodemailer.createTransport({
                                host: '////',
                                port: ////,
                                auth: {
                                   user: '////',
                                   pass: '////'
                                }
                            }); 
                        
                        
                            const message = {
                                from: '////', // Sender address
                                to: req.body.email,         // List of recipients
                                subject: 'Verify', // Subject line
                                text: 'Link: '+ "http://localhost:3000/verify/"+id// Plain text body
                            };
                            transport.sendMail(message, function(err, info) {
                                if (err) {
                                  console.log(err)
                                } else {
                                  console.log(info);
                                }
                            });
                    
                } else {
                    return true
                }
            })
        }

        else {
            return true;
        }
    })

})

app.get('/user', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.redirect('/')
    }
    else {
        res.render(__dirname + '/public/user.ejs', { name: req.cookies.LoggedIn })
    }
})

app.get('/user/log_out', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.redirect('/')
    }
    else {
        res.clearCookie('LoggedIn');
        res.redirect('/')
    }
})

app.get('/user/new', function (req, res) {
    if (req.cookies.LoggedIn == undefined) {
        res.redirect('/')
    }
    else {
        res.sendFile(__dirname + '/public/add.html')
    }
})



app.post('/user/new', function (req, res) {
    var id = uuidv4();
    var name = req.cookies.LoggedIn
    var title = req.body.title
    var text = req.body.text

    InsertNote.insert(name,title,id,text)

    res.send({ redirect: true, url: "/user" });
})


app.get('/user/notes/:id', function (req, res) {
    SelectById.getNote(req.params.id, function(note){
           if (note.name == req.cookies.LoggedIn ) {
               res.render(__dirname + '/public/view.ejs', { title: note.title, text: note.text, id:note.id })
           }
           else {
            res.redirect('/user')
           }
        })
       
})

app.post('/user/:id', function (req, res) {
    var newtext = req.body.newtext
    var id = req.params.id

    UpdateNote.update(newtext,id,function (err){
        if (err) {
            console.error(err)
        }
        else {
            console.log('Updated')
        }
    })

    res.send({ redirect: true, url: "/" });

    
})


app.post('/user/:id/delete', function (req, res) {
    var id = req.params.id

    DeleteNote.delete(id)

    res.send({ redirect: true, url: "/user" });

})

app.get('/user/settings',function(req, res){
    if (req.cookies.LoggedIn == undefined){
        res.redirect('/')
    }
    else {
        res.sendFile(__dirname+'/public/settings.html')
    }
})

app.post('/delete/settings/delete',function(req, res){
    var user = req.body.user

    DeleteUser.delete(user)

    console.log('User deleted')

    res.clearCookie('LoggedIn')
    req.method = 'get'; 
    res.redirect('/'); 
})

app.get('/user/settings/change_password',function(req, res){
    if (req.cookies.LoggedIn == undefined) {
        res.redirect('/');
    }
    else {
        res.sendFile(__dirname+'/public/changepassword.html')
    }
})




app.post('/user/settings/change_password',function(req, res){
    var password = req.body.newpass
    var name = req.cookies.LoggedIn

    UpdatePassword.update(password,name)

    console.log('Updated')
    res.clearCookie('LoggedIn')
    res.send({redirect: true, url: '/'});



})

app.get('/verify/:id',function(req, res){
    var id = req.params.id
    VerifyUser.verify(id)
    console.log('Verified')
    res.redirect('/')

    })






app.get('/images', function (req, res) {
    res.sendFile(__dirname + '/public/images/logo.jpg')
})

app.get('/data.json', function (req, res) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
        db.all("SELECT * FROM data WHERE name ="+"'"+req.cookies.LoggedIn+"'",function (err,rows){
            console.log(rows)
            res.json(rows)
        })
})

app.get('user/images/undo.png', function (req, res) {
    res.sendFile(__dirname + '/public/images/undo.png')
})

app.get('/images/back.png',function (req, res) {
    res.sendFile(__dirname + '/public/images/back.png')
})



app.listen(3000)