/*
* @Author: 谭智轩
* @Date:   2018-09-30 16:31:53
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-30 22:08:17
* @email: zhixuan.tan@qunar.com
*/
var fetchDataTime = require('./timeoutTimeDefine.js').fetchDataTime;

var fetch = function(data) {
    return new Promise(function(res, rej) {
        setTimeout(() => {
            res(data);
        }, fetchDataTime);
    })
}

global.fetch = fetch;
