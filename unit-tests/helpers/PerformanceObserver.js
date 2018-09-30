/*
* @Author: 谭智轩
* @Date:   2018-09-30 16:21:00
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-30 17:29:09
* @email: zhixuan.tan@qunar.com
*/
var navigationTiming = require('./capturedData/navigationTiming.js');
var resourceTiming = require('./capturedData/resourceTiming.js');


var PerformanceObserver = function(callback) {
    this.callback = callback;
}
PerformanceObserver.prototype.observe = function(config) {
    // this.callback([navigationTiming].concat(resourceTiming));
    this.callback(global.performance);
}
PerformanceObserver.prototype._manualChange = function(list) {
    this.callback(global.performance);
}

global.PerformanceObserver = PerformanceObserver;
module.exports = PerformanceObserver;

