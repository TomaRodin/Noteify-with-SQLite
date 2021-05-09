exports.delete = function(user) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });
        db.run("DELETE FROM users WHERE name = "+ "'"+user+ "'");

        db.run("DELETE FROM data WHERE name = "+ "'"+user+ "'");

        console.log('Delete')

}