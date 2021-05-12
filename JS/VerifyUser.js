exports.verify = function(id) {
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
    });
    db.serialize(function(){
        db.run('UPDATE users SET active = ? WHERE active_id = ?', ["true",id])
        db.close();
    }) 
    
}