var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
const { v4: uuidv4 } = require('uuid');
var ejs = require('ejs');
var fs = require('fs');
var app = express();


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

app.post('/', function (req, res) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
    });

    db.all("SELECT * FROM users WHERE name ="+"'"+req.body.user+"'",function (err,rows){
        var row = rows[0];
        console.log(row)
        if ( row === undefined) {
            console.log('Does not exist')
        }
        else {
            if (row.pass === req.body.pass) {
                console.log("Logged In")
                res.cookie('LoggedIn',row.name)
                res.send({ redirect: true, url: "/user" })
            }
            else {
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
                        db.run("INSERT INTO users (name,pass,mail ) VALUES ('"+ req.body.newuser +"','"+req.body.newpass+"','"+req.body.email+"')");
                        db.each("SELECT * FROM users", function (err, row) {
                            console.log(row.name, row.pass, row.id);
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
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });

    db.run("INSERT INTO data (name,title,id,text ) VALUES ('"+ req.cookies.LoggedIn +"','"+req.body.title+"','"+uuidv4()+"','"+ req.body.text +"')");
    db.each("SELECT * FROM data", function (err, row) {
        console.log(row.name, row.title, row.id, row.text);
    });
    res.send({ redirect: true, url: "/user" });
})


app.get('/user/notes/:id', function (req, res) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
        db.all("SELECT * FROM data WHERE id ="+"'"+req.params.id+"'",function (err,rows){
            var row = rows[0];
           if (row.name == req.cookies.LoggedIn ) {
               res.render(__dirname + '/public/view.ejs', { title: row.title, text: row.text, id:row.id })
           }
           else {
            res.redirect('/user')
           }
        })
})

app.post('/user/:id', function (req, res) {
    console.log(req.params.id)
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });

    db.run('UPDATE data SET text = ? WHERE id = ?', [req.body.newtext,req.params.id],function(err) {
        if (err) {
            console.error(err.message);
        }
        else {
            console.log('Updated')
        }
    })

    res.send({ redirect: true, url: "/" });
})


app.get('/user/:id/delete', function (req, res) {
    var notes = JSON.parse(fs.readFileSync('./data.json', 'UTF-8'));
    var note = notes.find(u => u.id === req.params.id);
    if (note.name == req.cookies.LoggedIn) {

    var array = JSON.parse(fs.readFileSync('./data.json', 'UTF-8'));
    console.log(array)
    const filterArray = array.filter((item) => item.id !== req.params.id);
    console.log('Deleted')
    console.log(filterArray)
    json = JSON.stringify(filterArray); //convert it back to json
    fs.writeFileSync('./data.json', json, { encoding: 'utf8', flag: 'w' });
    res.redirect('/user')
}   else {
    res.redirect('/')
}
})

app.get('/user/settings',function(req, res){
    if (req.cookies.LoggedIn == undefined){
        res.redirect('/')
    }
    else {
        res.sendFile(__dirname+'/public/settings.html')
    }
})

app.post('/user/settings/delete',function(req, res){
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
        db.all("SELECT * FROM users WHERE name ="+"'"+req.cookies.LoggedIn+"'",function (err,rows){
            var row = rows[0];
            console.log(row.id)
            db.run("DELETE FROM users WHERE id = "+row.id);
        })


    var arrayimage = JSON.parse(fs.readFileSync('./data.json', 'UTF-8'));
    console.log(arrayimage)
    const filterArraydata = arrayimage.filter((item) => item.name !== req.cookies.LoggedIn);
    console.log('Deleted')
    console.log(filterArraydata)
    json = JSON.stringify(filterArraydata); //convert it back to json
    fs.writeFileSync('./data.json', json, { encoding: 'utf8', flag: 'w' });
    res.clearCookie('LoggedIn')
    req.method = 'get'; 
    res.redirect('/'); 
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