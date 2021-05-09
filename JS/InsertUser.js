exports.insert = function(name,pass,mail) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
    db.serialize(function() {
        db.run("INSERT INTO users (name,pass,mail ) VALUES ('"+ name+"','"+pass+"','"+mail+"')");
        db.close();
    })
}