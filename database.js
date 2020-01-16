const mysql     = require('mysql');
const config = require('config');
const mysqlConfig = config.get('mysql');

var pool  = mysql.createPool(mysqlConfig);

const QUERY = {
    USERS_GET : "",
    USERS_POST : "",
    USERS_DELETE : "",

}

const generalQ = (query, paramArr, callback)=>{
    pool.getConnection(function(err, connection) {
        if(err) throw err;
        connection.query(query, paramArr, (error, rows)=> {
          connection.release();
          if (error) throw error;
          callback(rows);
        });
      });
}