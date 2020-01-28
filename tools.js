

//history 를 보고 이게 정상인지 확인
//[{Coin, Sec}, ...,], Target
const isChallengeOK=(history, target)=>{

}

const isNone = (value) =>{
    if(typeof value == "undefined" || value == null || value == "") return true;
    return false;
}

const isLogout = (req) =>{
    return isNone(req.session.uid);
}

//todo : req 를 받아서 로그 출력
const LOGD = (req) =>{
    
}

//todo : req 를 받아서 아이피, 계정 정보와 관련 데이터 로그를 저장
const saveLog = (req) =>{

}

const getChallengePoint = (History, Target) =>{
    if(!Array.isArray(History)) return -1;
    for(var i in History){
        Target -= History[i].Coin;
    }
    if(Target == 0) return 1;
    return 0;
}

module.exports = {
    isChallengeOK,
    isNone,
    isLogout,
    getChallengePoint
};