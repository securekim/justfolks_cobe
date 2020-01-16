

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

module.exports = {
    isChallengeOK,
    isNone,
    isLogout
};