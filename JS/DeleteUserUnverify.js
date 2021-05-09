exports.delete = function(name) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
    });

    db .serialize(function() {
        db.run("DELETE FROM users WHERE name = "+ "'"+name+ "'");
        db.close();
    })

        
}