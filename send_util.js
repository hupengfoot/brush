var request = require('request');
var config = require('./config');
var crypto = require('crypto');

var sendUtil = {};

var getTK = function(iQQ){
    var iTime = Math.floor(new Date().getTime() / 1000 / 3600);
    szTK = crypto.createHash('md5').update('dorisisnicegirl' + iQQ + iTime).digest('hex');
    return szTK;
};

var getQQ = function(cookiekey){
    try{
        return cookiekey.split('-')[0];
    }catch(e){
        return 0;
    }
};

var sendGetUrl = function(url, obj, key, cb){
    var sendUrl = config.host + ":"+ config.port + url + "?";
    for(var i in obj){
        sendUrl = sendUrl + i + "=" + obj[i] + "&";
    }
    sendUrl = sendUrl + "tk=" + getTK(getQQ(key));
    console.log(sendUrl);

    var cookiekey = "key=" + key;
    var cookie = request.cookie(cookiekey);
    var j = request.jar();
    j.setCookie(cookie, sendUrl);
    request({url: sendUrl, jar: j}, function (err, res, body) {
        cb(err, res);
    });
};

var sendPostUrl = function(url, obj, key, cb){
    var sendUrl = config.host + ":"+ config.port + url;
    console.log(sendUrl);
    obj.tk = getTK(getQQ(key));
    var cookiekey = "key=" + key;
    var cookie = request.cookie(cookiekey);
    var j = request.jar();
    j.setCookie(cookie, sendUrl);

    var post_option = {
	url: sendUrl,
	jar:j,
	form:obj,
    };
    request.post(post_option, cb);
};

sendUtil.sendGetUrl = sendGetUrl;
sendUtil.sendPostUrl = sendPostUrl;
sendUtil.getTK = getTK;
module.exports = sendUtil;
