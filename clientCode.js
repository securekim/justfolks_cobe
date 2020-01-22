
let SERVER = "127.0.0.1";
let PORT = "80"

function register(ID, Email, NM, Type, Point, Level, Platform){
    var request = new XMLHttpRequest();
    var path = SERVER+":"+PORT;
    request.onreadystatechange = function()
    {
      if ( request.readyState === 4 && request.status == 200 )
      {
        request.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
        request.open("POST", path, true);
        request.send("member_nm=newName&member_email=mail@google.com"); 
      }
    };

    request.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
    request.open("POST", path, true);
    request.send("member_nm=newName&member_email=mail@google.com"); 
}