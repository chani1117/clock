const sqlite3 = require('sqlite3').verbose();


sqlite3.Database.prototype.asyncAll = function(query, params){
  let db = this;
  return new Promise(function(resolve, reject) {
    if(params == undefined) params=[]

    db.all(query, params, function(err, rows)  {
        if(err) reject(err)
        else {
            resolve(rows)
        }
    });
  });
}


let processStatus = {
  isConn:false,
  connDtDay:false,
  connDtWeek:false,
  qstHistDay:false,
  qstHistWeek:false,
  currentStat: 0
}
let procKeys = Object.keys(processStatus);
const maxStat = procKeys.length -1;

let timerId = setInterval(function(){ init()}, 300);

const init = function(){

  if(processStatus.currentStat<maxStat){
    if(!processStatus.connDtWeek) initConnDtWeek(); //dtWeek exist ? dtDay:initHist    
  }

  if(processStatus.currentStat/maxStat == 1) clearInterval(timerId);
}

const db = new sqlite3.Database('./build/database.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    processStatus.isConn = true;
    processStatus.currentStat += 1;
  }
});


const initQst = function(){
  db.all('SELECT * FROM TB_QUEST',[],(err,rows)=>{
    processStatus.qst = true;
    processStatus.currentStat += 1;
  });
}

const initChar = function(){
  db.all('SELECT * FROM TB_CHAR ',[],(err,rows)=>{
    processStatus.char = true;
    processStatus.currentStat += 1;
  });
}

const initConnDtDay = function(){ //+3 hours , lostark reset = am 6:00 -> UTC +9, 
  db.all("SELECT DT FROM TB_CONN_DT WHERE DT = strftime('%Y%m%d', 'now', '3 hours')",[],(err,rows)=>{
    if(rows.length>0){ // connect log exist
      processStatus.connDtDay = true;
      processStatus.currentStat += 1;
      processStatus.qstHistDay = true;   
      processStatus.currentStat += 1;
    }else{ // connnect log not exist
      db.run("INSERT INTO TB_CONN_DT (DT) VALUES (strftime('%Y%m%d', 'now', '3 hours'));"
          ,[]
          ,(result,err)=>{
        processStatus.connDtDay = true;
        processStatus.currentStat += 1;
        initQstHistDay();
      });
    }   
  });
}

const initConnDtWeek = function(){ //+3 hours , lostark reset = am 6:00 -> UTC +9, 
  db.get("SELECT strftime('%w','now') AS w;",[],(err,rows)=>{
    let w1 = "strftime('%Y%m%d', 'now','3 hours' ,'weekday 3', '-7 days')";
    let w2 = "strftime('%Y%m%d', 'now','3 hours' ,'weekday 3', '-1 days')";
    let w3 = "strftime('%Y%m%d', 'now','3 hours' ,'weekday 3')";
    let w4 = "strftime('%Y%m%d', 'now','3 hours' ,'weekday 3', '6 days')";

    let startW, endW;

    if(rows.w > 3){ 
      startW = w1;
      endW = w2;
    }else{ 
      startW = w3;
      endW = w4;
    }   
    let betReq = startW + ' AND '+ endW;

    db.all("SELECT DT FROM TB_CONN_DT WHERE DT BETWEEN "+betReq,[],(err,rows)=>{
      if(rows.length>0){ // connect log exist
        processStatus.connDtWeek = true;
        processStatus.currentStat += 1;
        processStatus.qstHistWeek = true;   
        processStatus.currentStat += 1;
        initConnDtDay();
      }else{ // connnect log not exist
        db.run("INSERT INTO TB_CONN_DT (DT) VALUES (strftime('%Y%m%d', 'now', '3 hours'));"
            ,[]
            ,(result,err)=>{
          processStatus.connDtDay = true;
          processStatus.currentStat += 1;
          processStatus.connDtWeek = true;
          processStatus.currentStat += 1;
          initQstHistWeek();
          initQstHistDay();
        });
      }   
    });
  });
}

const initQstHistDay = function(){
  let inesrtHead = "INSERT INTO TB_QUEST_HIST (NM_QST , NM_CHAR ,QST_CNT , DT ) ";
  let selectHead = "SELECT NM_QST,NM_CHAR,RST_CNT,strftime('%Y%m%d', 'now', '-3 hours') AS DT FROM TB_QUEST CROSS JOIN TB_CHAR WHERE 1=1 "
  let whereRequire = "AND CD_RST_CYC = ? "

  //D01 day
  db.run(inesrtHead+selectHead+whereRequire,['D01'],(err,rows)=>{
    processStatus.qstHistDay = true;    
    processStatus.currentStat += 1;
  });
}

const initQstHistWeek = function(){
  let inesrtHead = "INSERT INTO TB_QUEST_HIST (NM_QST , NM_CHAR ,QST_CNT , DT ) ";
  let selectHead = "SELECT NM_QST,NM_CHAR,RST_CNT,strftime('%Y%m%d', 'now', '-3 hours') AS DT FROM TB_QUEST CROSS JOIN TB_CHAR WHERE 1=1 "
  let whereRequire = "AND CD_RST_CYC = ? "

  //D02 week
  db.run(inesrtHead+selectHead+whereRequire,['D02'],(err,rows)=>{
    processStatus.qstHistWeek = true;   
    processStatus.currentStat += 1; 
  });
}

module.exports.getProcessStatus = function(){
  return processStatus.currentStat/maxStat;
};

module.exports.insert = function(arg, arg2){
  if (processStatus.isConn) {    
        // db.run('INSERT INTO TEST(NAME,DESC,DATE) VALUES(?,?,datetime("now"))', [arg, arg2], (err) => {
        //   //console.log(`A row has been inserted with rowid ${this.lastID}`);
        //   if (err) {
        //     return console.log(err.message);
        //   }
        // });
  }
};

module.exports.getQuestList = function(){
  return db.asyncAll("SELECT NM_QST AS NM"
  +",(SELECT NM_CD_CM FROM TB_COMMON WHERE CM_CD_TYP='C02' AND CD_CM=CD_RST_CYC )AS CYC"
  +",RST_CNT AS CNT"
  +",(SELECT NM_CD_CM FROM TB_COMMON WHERE CM_CD_TYP='C01' AND CD_CM=CD_QST_RNG )AS RNG"
  +" FROM TB_QUEST", []);
}

module.exports.getCharacterList = function(){
  return db.asyncAll('SELECT * FROM TB_CHAR', []);
}

