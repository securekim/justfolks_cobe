const   express         = require('express'),
        config          = require('config'),
        bodyParser      = require("body-parser"),
        cors            = require("cors"),
        tools           = require('./tools'),
        database        = require('./database'),
        path            = require('path'),
        fs              = require('fs'),
        crypto          = require('crypto');
    ///////////////////////////////

    const session = require('express-session');
    const redis = require('redis');
    const redisClient = redis.createClient();
    const redisStore = require('connect-redis')(session);
    
    const app       = express();
    const server    = require('http').createServer(app);
    const io        = require('socket.io')(server);
    const sharedsession = require("express-socket.io-session");

    //////////////////////////////////
    
    const {
        isLogout,
        isLogoutWS,
        isNone,
        isChallengeOK,
        ERRMSG,
        HEADER,
        getChallengePoint,
        getIntoRoom,
        makeRoom,
        amIjoined,
        getUserInfo,
        amIhost,
        addHistoryToRoom,
        whoIsTheBest,
        delMemberToRoom,
        updateRoom,
        deleteRoom,
        deleteMyRoom,
        roomsJSON,
        rooms
    } = tools;

    const {
        generalQ,
        QUERY
    } = database;

    ///////////////////////////////////////

    redisClient.on('error', (err) => {
      console.log('Redis error: ', err);
    });
    
    var generalSession = session({
        secret: '_redisSessionSecret',
        key: '_redisKey',
        name: '_redisSession',
        resave: false,
        saveUninitialized: true,
        cookie: { 
          maxAge : 1000 * 60 * 60 * 5 //5시간
        },
        store: new redisStore({ host: 'localhost', port: 6379, client: redisClient, ttl: 86400 }),
      })

    app.use(generalSession);
    io.use(sharedsession(generalSession));

    io.on('connection', (socket) => {
        console.log(socket.handshake.session.uid + ' connected');
        socket.on('login',(userData)=>{
            console.log("login");
            console.log(userData);
            //userData : {ID, PW}
            let ID = userData.ID,
                PW = userData.PW;
            if(isNone(ID)){
                socket.emit('login', {fail: true, result: B_FAIL_ID});
            } else if(isNone(PW)) {
                socket.emit('login', {fail: true, result: B_FAIL_PW});
            } else {
                //한번 더 해싱
                PW = crypto.createHash('sha256').update(PW).digest('hex');
                let params = [ID, PW];
                generalQ(QUERY.LOGIN_POST,params,(result)=>{
                    if(result.fail){
                        socket.emit('login', {fail: true, result: B_FAIL_NOT_ACCEPTABLE});
                    } else {
                        if(result.rows.length == 0){
                            socket.emit('login', {fail: true, result: B_FAIL_NOT_FOUND});
                        } else {
                            socket.handshake.session.uid = ID;
                            socket.handshake.session.NM = result.rows[0].NM;
                            socket.handshake.session.level = result.rows[0].level;
                            socket.handshake.session.point = result.rows[0].point;
                            socket.handshake.session.save();
                            socket.emit('login', {fail: true, result: B_SUCCESS_REQ});
                        }
                    }
                });
            }
        });

        socket.on('getRoom', (msg) => {
            console.log("getRoom");
            if(isLogoutWS(socket)){
                socket.emit('getRoom', {fail: true, result: "Not Logged In."});
            } else {
                //{fail:true, result:""};
                let joinedRoom = amIjoined(socket);
                if(joinedRoom.fail){
                    let result = getIntoRoom(socket);
                    if(!result.fail){
                        socket.join("ROOM_"+result.result.hostID);
                        let userInfo = getUserInfo(socket)
                        io.to("ROOM_"+result.result.hostID).emit('playerChanged',{roomInfo:result.result ,newUser:userInfo});
                    }
                    socket.emit('getRoom', result);
                } else {
                    socket.emit('getRoom', {fail:true, result: joinedRoom.result});
                }
            }
        });
        
        socket.on('makeRoom', (msg) => {
            console.log("makeRoom");
            if(isLogoutWS(socket)){
                socket.emit('makeRoom', {fail: true, result: "Not Logged In."});
            } else {
                let joinedRoom = amIjoined(socket);
                let room = makeRoom(socket,2);
                if(room && joinedRoom.fail){
                    socket.join("ROOM_"+room.hostID);
                    socket.emit('makeRoom', {fail: false, result: room});
                } else {
                    socket.emit('makeRoom', {fail: true, result: "Your room is already exist."});
                }
            }
        });

        socket.on('startGame', (msg) => {
            console.log("startGame");
            if(isLogoutWS(socket)){
                socket.emit('startGame', {fail: true, result: "Not Logged In."});
            } else {
                let joinedRoom = amIjoined(socket);
                if(joinedRoom.fail){
                    socket.emit('startGame', {fail: true, result: "You are not joined to the room."});
                } else {
                    let iAmHost = amIhost(socket,joinedRoom);
                    //io.sockets.adapter.rooms[key].length
                    if(!iAmHost.fail){
                        //내가 방장이고, 방 내부 인원이 total 이상 전부 다 있을 때
                        console.log("startGame. You are the host.");
                        joinedRoom.result.status = "start"
                        updateRoom(socket, joinedRoom.result);
                        io.to("ROOM_"+joinedRoom.result.hostID).emit('startGame',{fail: false, result: joinedRoom.result});
                        
                    } 
                    // else {
                    //     socket.emit('startGame', {fail: true, result: "You are not a host."});
                    // }
                }
            }
        });

        //방에서 탈출
        socket.on('exitRoom', () => {
            console.log("exitRoom");
            if(isLogoutWS(socket)){
                socket.emit('exitRoom', {fail: true, result: "Not Logged In."});
            } else {
                let joinedRoom = amIjoined(socket);
                if(joinedRoom.fail){ //내가 방에 있나? fail이다.
                    socket.emit('exitRoom', {fail: true, result: "You are not in the room."});
                } else {
                    let updatedRoom = delMemberToRoom(socket, joinedRoom.result);
                    let userInfo = getUserInfo(socket);
                    updatedRoom.result.status = "end"
                    updateRoom(socket, updatedRoom.result);
                    deleteMyRoom(socket); //방장인 경우 방 삭제.
                    io.to("ROOM_"+updatedRoom.result.hostID).emit('playerChanged',{roomInfo:updatedRoom.result ,delUser:userInfo});
                    socket.emit('exitRoom', {fail: false, result: updatedRoom.result});
                    socket.leave("ROOM_"+updatedRoom.result.hostID);
                }
            }
        });

        socket.on('writeHistory', (history) => {
            console.log("writeHistory");
            console.log(history);
            if(isLogoutWS(socket)){
                socket.emit('writeHistory', {fail: true, result: "Not Logged In."});
            } else {
                //TODO : WriteHistory and Broadcast
                let result = addHistoryToRoom(socket, history);
                socket.emit("writeHistory", result);
                if(!result.fail){
                    io.to("ROOM_"+result.result.hostID).emit('roomHistory',{fail: false, result: result.result});
                    //현재 존재하는 인원 수 이상의 사람이 작성 한 경우.
                    if(Object.keys(result.result.histories).length >= result.result.IDS.length){
                        let winner = whoIsTheBest(result.result.histories, result.result.target);
                        io.to("ROOM_"+result.result.hostID).emit('endGame',{fail: false, result: winner});
                    }
                }
            }
        });

        socket.on('logout', () => {
            console.log("logout");
            delete socket.handshake.session.uid;
            socket.handshake.session.save();
        });
        
        socket.on('isLoggedIn', () => {
            console.log("isLoggedIn");
            socket.emit('isLoggedIn', {fail: isLogoutWS(socket), result: "N/A"});
        });

        socket.on('disconnect', () => {
            console.log("disconnect");
            console.log(socket.handshake.session.uid+' disconnected');
        });
      });
    let userPool = [];

//////////////////////HEADER/////////////////////
const H_SUCCESS_REQ         = 200;
const H_SUCCESS_MODIFY      = 201;
const H_FAIL_BAD_REQUEST    = 400;
const H_FAIL_UNAUTHORIZED   = 401;
const H_FAIL_FORBIDDEN      = 403;
const H_FAIL_NOT_FOUND      = 404;
const H_FAIL_NOT_ACCEPTABLE = 406;
const H_FAIL_SERVER_ERR     = 500;
const H_FAIL_SERVER_HACKED  = 501;

//////////////////////BODY/////////////////////
const B_SUCCESS_REQ         = "Success";
const B_SUCCESS_MODIFY      = "Modified";
const B_FAIL_ID             = "ID or Name is incorrect.";
const B_FAIL_PW             = "PW is incorrect.";
const B_FAIL_LOGIN          = "ID or PW is incorrect.";
const B_FAIL_UNAUTHORIZED   = "You are not logged in.";
const B_FAIL_FORBIDDEN      = "You don't have permission.";
const B_FAIL_WEIRD_DATA     = "Your data is weird.";
const B_FAIL_NOT_FOUND      = "There is no data.";
const B_FAIL_NOT_ACCEPTABLE = "Request is not acceptable."
const B_FAIL_SERVER_ERR     = "Undefined feature.";
const B_FAIL_SERVER_HACKED  = "Undefined feature.";


class RESULT {
    constructor(reason, result, header){
        this.reason = reason;
        this.result = result;
        this.header = header;
    }
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + '\\public')); 

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '\\public\\clientCode.html'));
});

app.route('/users')
    //todo [users] 전체 유저 정보 가져오기
    .get((req,res)=>{ 
        console.log("GET /users");
        res.status(H_FAIL_SERVER_ERR).send(B_FAIL_SERVER_ERR);
    })
    .post((req,res)=>{ 
        try{
            console.log("POST /users");
            //"INSERT INTO users(ID, Email, NM, type, point, level, platform) VALUES(_GENQ_);",
            let ID       =   req.body.ID
                ,PW      =   req.body.PW
                ,Email   =   req.body.Email
                ,NM      =   req.body.NM
                ,type    =   req.body.type
                ,point   =   0
                ,level   =   0
                ,platform =  req.body.platform;

            if(isNone(ID)){
                res.status(H_FAIL_BAD_REQUEST).send(B_FAIL_ID);
            } else if(isNone(NM)) {
                res.status(H_FAIL_BAD_REQUEST).send(B_FAIL_ID);
            } else if(isNone(PW)) {
                res.status(H_FAIL_BAD_REQUEST).send(B_FAIL_PW);
            } else {
                if(isNone(Email))       Email   = "none@none.com";
                if(isNone(type))        type    = "NA";
                if(isNone(platform))    platform= "NA";
                // 한번 더 HASH
                PW = crypto.createHash('sha256').update(PW).digest('hex');
                let params = [ID, PW, Email, NM, type, point, level, platform];
                generalQ(QUERY.USERS_POST,params,(result)=>{
                    if(result.fail){
                        res.status(H_FAIL_NOT_ACCEPTABLE).send(result.error);
                    } else {
                        res.status(H_SUCCESS_REQ).send(B_SUCCESS_REQ);
                    }
                });
            }
        }catch(e){
            console.log(e);
        }
    })
    //todo [users]회원 정보 수정
    .put((req,res)=>{ 
        res.status(H_FAIL_SERVER_ERR).send(B_FAIL_SERVER_ERR);
    })
    //todo [users]회원들 삭제 
    .delete((req,res)=>{ 
        res.status(H_FAIL_SERVER_ERR).send(B_FAIL_SERVER_ERR);
    })

//todo
app.route('/login')
    .get((req,res)=>{ 
        console.log("isLoggedIn");
        if(isLogout(req)) {
            res.status(H_FAIL_NOT_FOUND).send(B_FAIL_NOT_FOUND);
        } else {
            res.status(H_SUCCESS_REQ).send(req.session.uid);
        }
    })
    .post((req,res)=>{
        // req.body.ID
        // req.body.PW
        let ID = req.body.ID,
            PW = req.body.PW;
        if(isNone(ID)){
            res.status(H_FAIL_BAD_REQUEST).send(B_FAIL_ID);
        } else if(isNone(PW)) {
            res.status(H_FAIL_BAD_REQUEST).send(B_FAIL_PW);
        } else {
            //한번 더 해싱
            PW = crypto.createHash('sha256').update(PW).digest('hex');
            let params = [ID, PW];
            generalQ(QUERY.LOGIN_POST,params,(result)=>{
                if(result.fail){
                    res.status(H_FAIL_NOT_FOUND).send(result.error);
                } else {
                    if(result.rows.length == 0){
                        res.status(H_FAIL_NOT_FOUND).send(B_FAIL_NOT_FOUND);
                    } else {
                        req.session.uid = req.body.ID;
                        res.status(H_SUCCESS_REQ).send(result.rows);
                    }
                }
            });
        }
    })
    .delete((req,res)=>{
        console.log("logout");
        req.session.destroy();
        res.status(H_SUCCESS_REQ).send(B_SUCCESS_REQ);
    })

//todo
app.route('/history')
    .get((req,res)=>{
        if(isLogout(req)) res.status(H_FAIL_UNAUTHORIZED).send(B_FAIL_UNAUTHORIZED);
        else {
            let ID      = req.session.uid;
            generalQ(QUERY.HISTORY_GET,[ID],(result)=>{
                if(result.fail){
                    res.status(H_FAIL_NOT_FOUND).send(result.error);
                } else {
                    if(result.rows.length == 0){
                        res.status(H_FAIL_NOT_FOUND).send(B_FAIL_NOT_FOUND);
                    } else {
                        res.status(H_SUCCESS_REQ).send(result.rows);
                    }
                }
            });
        }
    }) // todo : 시각
    .post((req,res)=>{
        if(isLogout(req)) res.status(H_FAIL_UNAUTHORIZED).send(B_FAIL_UNAUTHORIZED);
        else {
            let History = req.body.History,
                target  = req.body.target,
                ID      = req.session.uid;
            if(isNone(History) || isNone(target)){
                res.status(H_FAIL_BAD_REQUEST).send(B_FAIL_WEIRD_DATA);
            } else {
                let point = getChallengePoint(History, target)
                let params = [ID, JSON.stringify(History), target, point];
                    generalQ(QUERY.HISTORY_POST,params,(result)=>{
                        if(result.fail){
                            res.status(H_FAIL_NOT_FOUND).send(result.error);
                        } else {
                            if(result.rows.length == 0){
                                res.status(H_FAIL_NOT_FOUND).send(B_FAIL_NOT_FOUND);
                            } else {
                                res.status(H_SUCCESS_REQ).send(result.rows);
                            }
                        }
                    });
            }
        }
        //req.body.ID
        //req.body.History []
        //req.body.target
    })


// app.get('/get/:value',(req,res)=>{
//     res.send(`
//             get value is : `+req.params.value+`
//     `)
// })
 
// app.post('/post',(req,res)=>{
//     res.send(`
//             post value is : `+req.body.value+`
//     `)
// })

app.get('/*', function(req, res) { 
    //todo : .. 이런거 다 삭제하기
    res.sendfile(req.url,function(err){
     if(err){
        console.log(err);
        res.status(H_FAIL_NOT_FOUND).send(B_FAIL_NOT_FOUND);
     }
    });
   });
   
process.on('uncaughtException', function (err) {
	//예상치 못한 예외 처리
	console.log('uncaughtException : ' + err);
});

server.listen(80); 