/*
* @Author: 谭智轩
* @Date:   2018-09-30 16:12:03
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-30 17:45:35
* @email: zhixuan.tan@qunar.com
*/
var performance = require('./performance.js');
var PerformanceObserver = require('./PerformanceObserver.js');
var navigator = require('./navigator.js');
var document = require('./document.js');
var windowOnLoad = require('./timeoutTimeDefine.js').windowOnLoad;

var window = {};

window.performance = performance;
window.PerformanceObserver = PerformanceObserver;
window.navigator = navigator;
window.document = document;
setTimeout(function(){
    if (typeof window.onload === 'function') {
        window.onload({});
    }
}, windowOnLoad);
global.window = window;