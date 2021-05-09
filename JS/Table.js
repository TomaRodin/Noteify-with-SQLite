const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('users', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});
db.serialize(function () {
    //db.run("DROP TABLE users")
    db.run("CREATE TABLE unverify ( name INTEGER PRIMARY KEY AUTOINCREMENT, title name NOT NULL, pass text NOT NULL, id text NOT NULL);");
});
db.close((err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Close the database connection.');
});