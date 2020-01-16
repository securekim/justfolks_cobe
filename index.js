var express         = require('express'),
    app             = express(),
    cors            = require("cors"),
    bodyParser      = require ("body-parser"),
    expressSession  = require('express-session'),
    RedisStore      = require('connect-redis')(expressSession),
    redis           = require('redis'),
    config          = require('config'),
    tools           = require('./tools'),
    database        = require('./database');
    
    const {
        isLogout,
        isNone,
        isChallengeOK,
        ERRMSG,
        HEADER
    } = tools;

    const {
        generalQ,
        QUERY
    } = database;

    let redisConfig = config.get('redis');
   
//////////////////////HEADER/////////////////////
const H_SUCCESS_REQ         = 200;
const H_SUCCESS_MODIFY      = 201;
const H_FAIL_BAD_REQUEST    = 400;
const H_FAIL_UNAUTHORIZED   = 401;
const H_FAIL_FORBIDDEN      = 403;
const H_FAIL_NOT_FOUND      = 404;
const H_FAIL_SERVER_ERR     = 500;

//////////////////////BODY/////////////////////
const B_FAIL_ID             = "ID is incorrect.";
const B_FAIL_PW             = "PW is incorrect.";
const B_FAIL_LOGIN          = "ID or PW is incorrect.";
const B_FAIL_UNAUTHORIZED   = "You are not logged in.";
const B_FAIL_FORBIDDEN      = "You don't have permission.";
const B_FAIL_NOT_FOUND      = "There is no data.";

class RESULT {
    constructor(reason, result, header){
        this.reason = reason;
        this.result = result;
        this.header = header;
    }
}
    
redisConfig.client = redis.createClient(redisConfig.port,redisConfig.host);

const session = expressSession({
    secret : new Date().getMilliseconds()+"cobe",
    resave : false,
    store  : new RedisStore(redisConfig),
    saveUninitialized:true,
    cookie : {
        maxAge : 1000 * 60 * 60 * 5 //5시간
    }
});

app.use(session);

app.use(bodyParser.json());
app.use(cors());

//todo
app.route('/users')
    .get((req,res)=>{
        res.status(H_FAIL_NOT_FOUND).send(B_FAIL_NOT_FOUND);
    })
    .post((req,res)=>{

    })
    .put((req,res)=>{

    })
    .delete((req,res)=>{

    })

//todo
app.route('/login')
    .post((req,res)=>{
        // req.body.ID
        // req.body.PW
        if(SUCCESS){ //todo
            req.session.uid = req.body.ID;
            res.status(H_SUCCESS_REQ).send("Login Success");
        } else {
            res.status(H_FAIL_UNAUTHORIZED).send(B_FAIL_UNAUTHORIZED);
        }
    })
    .delete((req,res)=>{
        if(isLogout(req)) res.status(H_FAIL_UNAUTHORIZED).send(B_FAIL_UNAUTHORIZED);
        res.status(H_FAIL_FORBIDDEN).send(B_FAIL_FORBIDDEN);
        return;
        // if(SUCCESS){ //todo
        //     req.session.destroy();
        //     res.status(H_SUCCESS_REQ).send("Logout Success");
        // } else {
        //     res.status(H_FAIL_NOT_FOUND).send("Logout Fail");
        // }
    })

//todo
app.route('/challenge')
    .get((req,res)=>{
        if(isLogout(req)) res.status(H_FAIL_UNAUTHORIZED).send(B_FAIL_UNAUTHORIZED);
    })
    .post((req,res)=>{
        if(isLogout(req)) res.status(H_FAIL_UNAUTHORIZED).send(B_FAIL_UNAUTHORIZED);
        //req.body.ID
        //req.body.History []
        //req.body.Target
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

app.listen(80); 