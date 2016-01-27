var async = require('async');
var sleep = require('sleep');
var request = require('request');
var config = require('./config');
var send_util = require('./send_util');

var argument = process.argv.splice(2);
var iMyQQ = 584295354;

var login = function(next){
    var obj = {};
    obj.iQQ = iMyQQ;

    var sendUrl = config.host + ":"+ config.port + '/login' + "?";
    for(var i in obj){
        sendUrl = sendUrl + i + "=" + obj[i] + "&";
    }
    sendUrl = sendUrl + "tk=" + send_util.getTK(iMyQQ);
    console.log(sendUrl);

    var cookiekey = "skey=" + '@FYsHf6iGS';
    var cookie = request.cookie(cookiekey);
    var j = request.jar();
    j.setCookie(cookie, sendUrl);
    request({url: sendUrl, jar: j}, function (err, res, body) {
	console.log(res.body);
        next(null);
    });

};

var alive = function(){
    var obj = {};
  
    send_util.sendGetUrl('/enum/maxexp', obj, argument[0], function(err, res){
	console.log(res.body);
	setTimeout(alive, 3600000);
    });
   
};

var card = function(next){
    var publishcard = function(iProductID, cb){
        var obj = {};
        obj.iProductID = iProductID;
        obj.iQQ = iMyQQ;
        obj.iAct = 1;
        obj.szContent = '';
        obj.szDetail = '';
        send_util.sendGetUrl('/card/publishcard', obj, argument[0], function(err, res){
            sleep.sleep(1);
	    console.log(res.body);
            cb(null);
        });
    };
    
    var num = 1;
    async.whilst(
        function(){return num < 42},
        function(callback){
            publishcard(num, function(){
                num ++;
                callback(null);
            });
        },
        function(err){
	    next(null);
        }
    );
};

//签到
var registration = function(next){
    var getTaskDaily = function(cb){
        var obj = {};
        obj.iQQ = iMyQQ;
        send_util.sendGetUrl('/task/daily/get', obj, argument[0], function(err, res){
	   console.log(res.body);
	   cb(null, JSON.parse(res.body).result);
        });
    };
    
    var setDailyAnswer = function(taskInfo, cb){
        console.error(taskInfo);
        var obj = {};
        obj.iQQ = iMyQQ;
        obj.iAnsChoiceID = taskInfo.questioninfo[0].iOptionID;
        obj.szAnsContent = '';
        obj.iDailyTaskID = taskInfo.iDailyTaskID;
        send_util.sendGetUrl('/task/daily/setanswer', obj, argument[0], function(err, res){
	   console.log(res.body);
	    cb(null);
        });
    };
    
    async.waterfall([
        getTaskDaily,	
        setDailyAnswer,
    ], function(err, results){
	next(null);
    });
};

//发弹幕
var bili = function(next){
    var articleList = function(cb){
        var obj = {};
        obj.iProductID = 19;
        obj.iClassID = '';
        obj.iPageNum = 0;
        obj.iPageSize = 1;
        obj.iArticleID = '';
        obj.iType = 13;
        obj.iMasterArticle = '';
        obj.isContestants = 0;
        obj.iOrder = 5;
    
        send_util.sendGetUrl('/user/article/articlelist', obj, argument[0], function(err, res){
	   console.log(res.body);
	   cb(null, JSON.parse(res.body).result)
        });
    };
    
    var biliset = function(articleInfo, cb){
        var obj = {};
        obj.szComment = '侬脑子瓦特啦';
        obj.szID = articleInfo.rows[0].iArticleID;
        
        send_util.sendGetUrl('/bili/set', obj, argument[0], function(err, res){
	    console.log(res.body);
	   cb(null, JSON.parse(res.body).result);
        });
    };

    async.waterfall([
        articleList,
        biliset,
    ], function(err, results){
	next(null);
    });
};

//翻牌
var flop = function(next){
    var getTodayCard = function(cb){
	var obj = {};
	obj.iQQ = iMyQQ;
	
        send_util.sendGetUrl('/gamewiki/gettodaycards', obj, argument[0], function(err, res){
	    console.log(res.body);
	   cb(null, JSON.parse(res.body).result)
        });
    };

    var setfloppedgame = function(gameInfo, cb){
	var obj = {};
	obj.iQQ = iMyQQ;
	obj.iFloppedGame = gameInfo.gameList[0].iLikeArticleID;

        send_util.sendPostUrl('/gamewiki/setfloppedgame', obj, argument[0], function(err, res){
	    console.log(res.body);
	    cb(null, JSON.parse(res.body).result)
        });
    };

    async.waterfall([
	getTodayCard,
	setfloppedgame
    ], function(err, results){
	next(null);
    });
};

var getActivityValue = function(next){
    var dotask = function(num, cb){
        var obj = {};
        obj.iQQ = iMyQQ;
        obj.iTaskType = num;
        obj.szIdentify = Math.random();
    
        send_util.sendPostUrl('/user/active/dotask', obj, argument[0], function(err, res){
	    console.log(res.body);
    	cb(null);
        });
    };
    
    var count = 1;
    async.whilst(
        function(){return count < 12},
        function(callback){
    	dotask(count, function(err){
    	    count ++;
    	    sleep.sleep(1);
    	    callback(null);
    	});
        },
        function(err){
	    //阅读推荐文章活跃值可以加4次
	    var count1 = 1;
	    async.whilst(
		function(){return count1 < 4},
		function(callback1){
		    dotask(2, function(err){
			count1 ++;
			callback1(null);
		    });
		},
		function(err){
		    next(null);
		}
	    );
        }
    );
}

var getExp = function(next){
    var getmine = function(cb){
	var obj = {};
	obj.iQQ = iMyQQ;
        
	send_util.sendGetUrl('/user/active/getmine', obj, argument[0], function(err, res){
	   cb(null, JSON.parse(res.body).result);
        });
    };

    var getReward = function(info, cb){
	var obj = {};
	obj.iQQ = iMyQQ;
	obj.iRewardIndex = info.myRewardRecord[0].iRewardIndex;
	send_util.sendPostUrl('/user/active/getreward', obj, argument[0], function(err, res){
	   console.log(res.body);
	   cb(null);
        });
    };

    async.waterfall([
	getmine,
	getReward,
    ], function(err, result){
	next(null);
    });
};

//保活cookie请求
alive();

//定时扫现网任务
var do_main = function(){
    async.waterfall([
        card,
        registration,
        flop,
        bili,
        getActivityValue,
        getExp,
    ], function(err, results){
	setTimeout(do_main, 28800000);
    });
};

do_main();


