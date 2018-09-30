/*
* @Author: 谭智轩
* @Date:   2018-09-30 16:10:08
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-30 17:35:40
* @email: zhixuan.tan@qunar.com
*/

var navigationTiming = require('./capturedData/navigationTiming.js');
var resourceTiming = require('./capturedData/resourceTiming.js');

var performance = {};
performance.getEntries = function() {
    return [navigationTiming].concat(resourceTiming);
};

performance.getEntriesByType = function(typeStr) {
    if (typeStr === 'resource') {

        return resourceTiming;
    }
    if (typeStr === 'navigation') {
        return [navigationTiming];
    }
};

// console.log('performance: ', performance);
global.performance = performance;
module.exports = performance;
