const mysql     = require('mysql');
const config = require('config');
const mysqlConfig = config.get('mysql');

var pool  = mysql.createPool(mysqlConfig);

let QUERY = {
    //콤마와 _GENQ_ 같이 사용시 유의.
    USERS_POST      : "INSERT INTO users(ID, PW, Email, NM, Type, Point, Level, Platform) VALUES(_GENQ_);",
    LOGIN_POST      : "SELECT ID, Email, NM, Type, Point, Level, Platform FROM users WHERE ID = ? and PW = ?"
}
generateQuery();

//콤마 갯수만큼 Question mark 만들어줌
function generateQuery(){
  for(var q in QUERY){
    let count = (QUERY[q].match(/,/g) || []).length;
    let genQ = "?";
    for(let i = 0; i<count; i++){
      genQ += ", ?";
    }
    QUERY[q] = QUERY[q].replace("_GENQ_", genQ);
  }
}

const generalQ = (query, paramArr, callback)=>{
    pool.getConnection(function(err, connection) {
        console.log("generalQ, Connection get.");
        if(err) throw err;
        connection.query(query, paramArr, (error, rows)=> {
          connection.release();
          let result = {
            fail : false,
            error : null,
            rows : []
          }
          if (error){
            result.fail = true;
            result.error = error;
          };
          result.rows = rows;
          callback(result);
        });
      });
}

module.exports = {
    generalQ,
    QUERY,
};