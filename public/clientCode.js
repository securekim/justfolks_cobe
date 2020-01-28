
let SERVER = "http://127.0.0.1:80";

/*   
    [HEADER]
    H_SUCCESS_REQ         = 200;
    H_SUCCESS_MODIFY      = 201;
    H_FAIL_BAD_REQUEST    = 400;
    H_FAIL_UNAUTHORIZED   = 401;
    H_FAIL_FORBIDDEN      = 403;
    H_FAIL_NOT_FOUND      = 404;
    H_FAIL_NOT_ACCEPTABLE = 406;
    H_FAIL_SERVER_ERR     = 500;
*/

/*
   [Register User]
   ID : 아이디 
   PW : 패스워드
   EMail : 비워도 됨
   NM : 닉네임
   Type : kakao / facebook / google / NA
   Platform : iOS / Android / Web / NA

   Callback(JSON) : {status, result}
    
   //USAGE EXAMPLE
        register("myID", "myPW", "myEmail@email.com", "myNickName", "NA", "Web", (result)=>{
            console.table(result);
        })
*/
function register(ID, PW, Email, NM, Type, Platform, callback){
    GENERAL_REQ("POST", SERVER+"/users", {ID:ID, PW:SHA256(PW), Email:Email, NM:NM, Type:Type, Platform:Platform}, (result)=>{
        callback(result);
    });
}

/*
   [Login]
   ID : 아이디 
   PW : 패스워드

   Callback(JSON) : {status, result}
    
   //USAGE EXAMPLE
        login("myID", "myPW", (result)=>{
            console.table(result);
        })
*/
function login(ID, PW, callback){
    GENERAL_REQ("POST", SERVER+"/login", {ID:ID, PW:SHA256(PW)}, (result)=>{
        callback(result);
    })
}

/*
   [로그인 된 상태인지 확인]
   Callback(JSON) : {status, result}
    
   //USAGE EXAMPLE
        isLoggedIn((result)=>{
            console.table(result);
        })
*/
function isLoggedIn(callback){
    GENERAL_REQ("GET", SERVER+"/login", null, (result)=>{
        callback(result);
    })
}

/*
   [Logout]
   Callback(JSON) : {status, result}
    
   //USAGE EXAMPLE
        logout((result)=>{
            console.table(result);
        })
*/
function logout(callback){
    GENERAL_REQ("DELETE", SERVER+"/login", null, (result)=>{
        callback(result);
    });
}



/*
   [게임 종료 후 결과 로깅하는 부분]
   [이상한 데이터가 넘어올 시 서버에서는 해킹이라고 판단, 일단 -1점]
   History : [{Coin: 'CoinType', Sec : 'Press Time(ms)'}, ...] 
   Target  : Target

   Callback(JSON) : {status, result}
    
   //USAGE EXAMPLE
        writeChallenge([{Coin: 500, Sec : 100}, {Coin: 100, Sec : 250}, {Coin: 100, Sec : 500}] , 700, (result)=>{
            console.table(result);
        };
*/
function writeChallenge(History, Target, callback){
    GENERAL_REQ("POST", SERVER+"/challenge", {History:History, Target:Target}, (result)=>{
        callback(result);
    });
}




function GENERAL_REQ(method, url, jsonData, callback){
    console.log("General REQ : "+method);
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
        if(xhr.readyState == 4 && typeof callback != "undefined") //여러번 호출되므로 종료시에만
            callback({status:xhr.status, result:xhr.responseText});
    };
    if(typeof jsonData == "undefined" || !jsonData) {
        xhr.send();
    } else {
        console.log(jsonData);
        xhr.send(JSON.stringify(jsonData));
    }
    
}

function SHA256(r){
    var n=8,t=0;function e(r,n){var t=(65535&r)+(65535&n);return(r>>16)+(n>>16)+(t>>16)<<16|65535&t}function o(r,n){return r>>>n|r<<32-n}function u(r,n){return r>>>n}function a(r,n,t){return r&n^~r&t}function f(r,n,t){return r&n^r&t^n&t}function c(r){return o(r,2)^o(r,13)^o(r,22)}function i(r){return o(r,6)^o(r,11)^o(r,25)}function h(r){return o(r,7)^o(r,18)^u(r,3)}return function(r){for(var n=t?"0123456789ABCDEF":"0123456789abcdef",e="",o=0;o<4*r.length;o++)e+=n.charAt(r[o>>2]>>8*(3-o%4)+4&15)+n.charAt(r[o>>2]>>8*(3-o%4)&15);return e}(function(r,n){var t,C,g,A,d,v,S,l,m,y,w,b=new Array(1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298),p=new Array(1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225),B=new Array(64);r[n>>5]|=128<<24-n%32,r[15+(n+64>>9<<4)]=n;for(var D=0;D<r.length;D+=16){t=p[0],C=p[1],g=p[2],A=p[3],d=p[4],v=p[5],S=p[6],l=p[7];for(var E=0;E<64;E++)B[E]=E<16?r[E+D]:e(e(e(o(w=B[E-2],17)^o(w,19)^u(w,10),B[E-7]),h(B[E-15])),B[E-16]),m=e(e(e(e(l,i(d)),a(d,v,S)),b[E]),B[E]),y=e(c(t),f(t,C,g)),l=S,S=v,v=d,d=e(A,m),A=g,g=C,C=t,t=e(m,y);p[0]=e(t,p[0]),p[1]=e(C,p[1]),p[2]=e(g,p[2]),p[3]=e(A,p[3]),p[4]=e(d,p[4]),p[5]=e(v,p[5]),p[6]=e(S,p[6]),p[7]=e(l,p[7])}return p}(function(r){for(var t=Array(),e=(1<<n)-1,o=0;o<r.length*n;o+=n)t[o>>5]|=(r.charCodeAt(o/n)&e)<<24-o%32;return t}(r=function(r){r=r.replace(/\r\n/g,"\n");for(var n="",t=0;t<r.length;t++){var e=r.charCodeAt(t);e<128?n+=String.fromCharCode(e):e>127&&e<2048?(n+=String.fromCharCode(e>>6|192),n+=String.fromCharCode(63&e|128)):(n+=String.fromCharCode(e>>12|224),n+=String.fromCharCode(e>>6&63|128),n+=String.fromCharCode(63&e|128))}return n}(r)),r.length*n))
}