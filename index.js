var express         = require('express'),
    app             = express(),
    cors            = require("cors"),
    bodyParser      = require ("body-parser"),
    expressSession  = require('express-session'),
    RedisStore      = require('connect-redis')(expressSession),
    redis           = require('redis'),
    config          = require('config');

    let redisConfig = config.get('redis');

const SUCCESS_REQ = 200;
const SUCCESS_MODIFY =201;

const FAIL_BAD_REQUEST = 400;
const FAIL_UNAUTHORIZED = 401;
const FAIL_FORBIDDEN = 403;
const FAIL_NOT_FOUND = 404;
const FAIL_SERVER_ERR = 500;

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
        maxAge : 1000 * 60 * 60
    }
});

app.use(session);

app.use(bodyParser.json());
app.use(cors());

//todo
app.route('/users')
    .get((req,res)=>{
        res.status(FAIL_NOT_FOUND).send("Block not found");
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
            res.status(SUCCESS_REQ).send("Login Success");
        } else {
            res.status(FAIL_UNAUTHORIZED).send("Login Fail");
        }
    })
    .delete((req,res)=>{
        if(SUCCESS){ //todo
            req.session.destroy();
            res.status(SUCCESS_REQ).send("Logout Success");
        } else {
            res.status(FAIL_NOT_FOUND).send("Logout Fail");
        }
    })

//todo
app.route('/challenge')
    .post((req,res)=>{
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