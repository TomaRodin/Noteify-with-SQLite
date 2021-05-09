exports.update = function(newtext,id,callback){
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Connected to the database.');
    });

    db.run('UPDATE data SET text = ? WHERE id = ?', [newtext,id],function(err) {
            callback(err)
        })
}
