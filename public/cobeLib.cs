// Converted from UnityScript to C# at http://www.M2H.nl/files/js_to_c.php - by Mike Hergaarden
// Do test the code! You usually need to change a few small bits.


//socket io -> 
//https://archive.codeplex.com/?p=socketio4net
//Install-Package SocketIO4Net.Client -Version 0.6.26

using UnityEngine;
using System;
using System.Collections;
using System.Text;
// FOR NETWORKING /////////////////////////////////////////
//  using SocketIO; // -> socketIO Lib
using socket.io;    // -> NHN Library
using UnityEngine.Networking;
using System.Security.Cryptography;
///////////////////////////////////////////////////////////

public class cobeLib : MonoBehaviour {

//[HEADER]
static int H_SUCCESS_REQ         = 200;
static int H_SUCCESS_MODIFY      = 201;
static int H_FAIL_BAD_REQUEST    = 400;
static int H_FAIL_UNAUTHORIZED   = 401;
static int H_FAIL_FORBIDDEN      = 403;
static int H_FAIL_NOT_FOUND      = 404;
static int H_FAIL_NOT_ACCEPTABLE = 406;
static int H_FAIL_SERVER_ERR     = 500;
static int H_FAIL_SERVER_HACKED  = 501;


    public Socket socket = Socket.Connect("http://aws.securekim.com");
    //readonly Dictionary<string, Action<string>> _handlers = new Dictionary<string, Action<string>>();

    public void init(System.Action<string> callback){
    /////////////////////////////////////////////// TEST SERVER //////////////////////////
        // 서버로 접속 시도~
        
        // 접속 완료 이벤트 처리

        socket.On("connect", () => {
            Debug.Log("Connected.");
            callback("CALLBACK TEST : connected");
        });

        /////////// SOCKET ON - RES PACKET FROM SERVER /////////


        //방을 가져왔다. 방이 하나도 없으면 만들어서 가져온다.
        socket.On("getRoom", (string data) => {
            //{"fail":false,"result":{"hostID":"myID","total":2,"IDS":["myID"],"target":null,"histories":{}}}
            Debug.Log("getRoom : " + data);
        });

        //방이 꽉차면 
        //  TODO : 스타트게임!
        socket.On("fullRoom", (string data)=>{
            Debug.Log("fullRoom : "+data);
//            multi_startGame();
        });

        socket.On("exitRoom", (string data)=>{
             Debug.Log("exitRoom : " + data);
        });

        //hostID: "myID"
        //hostNM: "myNickName"
        //level: 0
        //point: 0
        //total: 2
        //IDS: ["myID"]
        //target: 900

        // 내가 참여를 해놓고 새로 방을 팔 수도 있다. 
        socket.On("makeRoom", (string data)=>{
            // [WS] makeRoom :{"fail":true,"result":"Your room is already exist."}
            Debug.Log("makeRoom : " + data);
        });

        //게임이 시작되었습니다 알림.
        socket.On("startGame", (string data) => {
            //{"fail":false,"result":{"hostID":"myID","hostNM":"myNickName","level":0,"point":0,"total":2,"IDS":["myID","myID2"],"target":600,"histories":{}}}
            Debug.Log("startGame : " + data);
        });

        //누군가 들어왔거나 나갔다.
        socket.On("playerChanged", (string data) => {
            Debug.Log("playerChanged : " + data);
//            TODO : 방에 사람이 꽉차면 게임을 시작해 주세요
//            if(data.roomInfo.total <= data.roomInfo.IDS.length){
//              방에 사람이 꽉차부렀네
//                multi_startGame();
//            }
        });
    }

    public void login(string ID, string PW, System.Action<string> callback){
        string PW_Hashed=computeSHA256(PW);
        Debug.Log("login ID: "+ID+" PW : "+PW+" Hashed: "+PW_Hashed);

//{ID:'myID', PW:'c6baabf1af85ddeb1c066f9bc07262e74910da4fa69bc3cf482ea2c6dcbc
        //가긴 가는데 파싱 불가
        //socket.Emit("login", "{ID:'"+ID+"', PW:'"+PW_Hashed+"'}");
        //오긴옴
        //socket.Emit("login", "{ID:"+ID+", PW:"+PW_Hashed+"}");
        socket.Emit("login", "{'ID':'"+ID+"','PW':'"+PW_Hashed+"'}");

        // socket.Emit(
        // "login",       // 이벤트명
        // "{ \"ID\": \"myID\", \"PW\": \"c6baabf1af85ddeb1c066f9bc07262e74910da4fa69bc3cf482ea2c6dcbc\" }"  // 데이터 (Json 텍스트)
        // );
        socket.On("login", (string data) => {
            //Body
            callback(data);
        });
    }
    public void isloggedIn(System.Action<string> callback){
        socket.Emit("isLoggedIn");
        socket.On("isLoggedIn", (string data)=>{
            //True / False & ID
            callback(data);
        });
    }

    public static string computeSHA256(string rawData)  
        {  
            // Create a SHA256   
            using (SHA256 sha256Hash = SHA256.Create())  
            {  
                // ComputeHash - returns byte array  
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(rawData));  
  
                // Convert byte array to a string   
                StringBuilder builder = new StringBuilder();  
                for (int i = 0; i < bytes.Length; i++)  
                {  
                    builder.Append(bytes[i].ToString("x2"));  
                }  
                return builder.ToString();  
            }  
        }  
}