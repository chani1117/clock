const sqlite3 = require('sqlite3').verbose();

let isConn = false;
let db = new sqlite3.Database('./build/database.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the DB database.');  
    isConn = true;
    db.run('CREATE TABLE IF NOT EXISTS TEST ( IDX INTEGER PRIMARY KEY, NAME TEXT, DESC TEXT, DATE TEXT )',[], arg=>{
      console.log('create',arg);
    });
  }
});

/*

select strftime('%Y%m%d', 'now','weekday 3');
select strftime('%Y%m%d', 'now', 'weekday 3','-7 days');
select strftime('%Y%m%d', 'now');


SELECT CASE WHEN strftime('%Y%m%d', 'now','-2 days') BETWEEN strftime('%Y%m%d', 'now','weekday 3','-7 days') AND strftime('%Y%m%d', 'now', 'weekday 3')
THEN 'true' ELSE 'false' END;
*/


module.exports.insert = function(arg, arg2){
  if (isConn) {    
        db.run('INSERT INTO TEST(NAME,DESC,DATE) VALUES(?,?,datetime("now"))', [arg, arg2], (err) => {
          //console.log(`A row has been inserted with rowid ${this.lastID}`);
          if (err) {
            return console.log(err.message);
          }
        });
  }
};