exports.select = function(id,callback) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });

    db.serialize(function () {
        db.all("SELECT * FROM users WHERE active_id =" + "'" + id + "'", function (err, rows) {
            callback(rows[0])
            db.close()
        })
    });
}