exports.delete = function(id) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
    });
    db.run("DELETE FROM data WHERE id = "+ "'"+id+ "'");
}