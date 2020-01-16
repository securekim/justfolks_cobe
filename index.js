var express         = require('express'),
    app             = express(),
    cors            = require("cors"),
    bodyParser      = require ("body-parser"),
    expressSession  = require('express-session'),
    RedisStore      = require('connect-redis')(expressSession),
    redis           = require('redis'),
    config          = require('config');

    let redisConfig = config.get('redis');

const RES_SUCCESS_REQ = 200;
const RES_SUCCESS_MODIFY =201;
const RES_FAIL_REQ = 400;
const RES_FAIL_FORBIDDEN = 403;
const RES_FAIL_GET = 404;
const RES_FAIL_SERVER = 500;

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

app.route('/users')
    .get((req,res)=>{
        res.status(400).send("Block not found");
    })
    .post((req,res)=>{

    })
    .put((req,res)=>{

    })
    .delete((req,res)=>{

    })

app.route('/login')
    .post((req,res)=>{
        // req.body.ID
        // req.body.PW
    })
    .delete((req,res)=>{

    })

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