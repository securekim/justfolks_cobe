
let SERVER = "http://127.0.0.1:80";

/*   
   [status]
   0 또는 500 이상 인 경우 서버 에러
   400 이상 ~ 500 미만 : 클라이언트 요청 에러
   200 이상 300 미만 : 성공
*/

/*
   [Register User]
   ID : 아이디 
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
    GENERAL_REQ("POST", SERVER+"/users", {ID:ID, PW:PW, Email:Email, NM:NM, Type:Type, Platform:Platform}, (result)=>{
        callback(result);
    });
}

function login(ID, PW){
    
}

function GENERAL_REQ(method, url, jsonData, callback){
    console.log("General REQ : "+method);
    console.log(jsonData);
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
        console.log("onreadystatechange : "+xhr.readyState);
        if(xhr.readyState == 4) //여러번 호출되므로 종료시에만
            //var json = JSON.parse(xhr.responseText);
            //console.log(json.email + ", " + json.password);
            callback({status:xhr.status, result:xhr.responseText});
    };
    //let data = JSON.stringify({"email": "hey@mail.com", "password": "101010"});
    xhr.send(JSON.stringify(jsonData));
}

function GENERAL_GET(url, callback){
    var xhr = new XMLHttpRequest();
    //var url = "url?data=" + encodeURIComponent(JSON.stringify({"email": "hey@mail.com", "password": "101010"}));
    xhr.open("GET", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if(xhr.readyState == 4){
            callback({status:xhr.status, result:xhr.responseText});
        }
    };
    xhr.send();
}