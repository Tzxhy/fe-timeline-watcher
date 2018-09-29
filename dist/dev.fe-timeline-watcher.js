'use strict';

/*
* @Author: 谭智轩
* @Date:   2018-09-28 11:16:13
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-28 16:36:14
* @email: zhixuan.tan@qunar.com
*/
var noop = function () { };
var CONSTANTS;
(function (CONSTANTS) {
    CONSTANTS[CONSTANTS["FIRST_PAGE"] = 0] = "FIRST_PAGE";
    CONSTANTS[CONSTANTS["LOAD_RESOURCE"] = 1] = "LOAD_RESOURCE";
    CONSTANTS[CONSTANTS["ERROR"] = 2] = "ERROR";
})(CONSTANTS || (CONSTANTS = {}));
var Watcher = /** @class */ (function () {
    function Watcher(watcherUrl, needResourceInfo, needPageLoadInfo, needErrorInfo) {
        if (watcherUrl === void 0) { watcherUrl = '//touch.tzx.qunar.com/watcher'; }
        if (needResourceInfo === void 0) { needResourceInfo = true; }
        if (needPageLoadInfo === void 0) { needPageLoadInfo = true; }
        if (needErrorInfo === void 0) { needErrorInfo = true; }
        var _this = this;
        Watcher.watcherUrl = watcherUrl;
        if (window.performance && window.performance.getEntries) {
            if (window.PerformanceObserver) {
                this.getLatestEntries = this.getLatestEntries.bind(this);
                var observer = new PerformanceObserver(this.getLatestEntries);
                observer.observe({ entryTypes: ['resource'] });
            }
        }
        else {
            console.info('Your browser doesn\'t support Performance API. We cann\'t record any data. See you.');
            return null;
        }
        this._sendType = CONSTANTS.FIRST_PAGE;
        this._hasReadIndex = 0;
        this._messageBuf = [];
        this.doOnce();
        // 初始化Performance监察者对象
        // const self: any = this;
        console.log('document.readyState: ', document.readyState);
        if (document.readyState !== 'complete') {
            var oldOnload_1 = window.onload || noop;
            window.onload = function (e) {
                setTimeout(function () {
                    var _a;
                    _a = Watcher.getFirstEntries(), _this._entriesPageLoad = _a[0], _this._entriesResource = _a[1];
                    console.log('this._entriesPageLoad: ', _this._entriesPageLoad);
                    _this._hasReadIndex = 0;
                    _this.sendBuf();
                }, 0);
                return oldOnload_1.bind(e).call(e);
            };
        }
        else {
            this.sendBuf();
        }
    }
    Watcher.getFirstEntries = function () {
        return [
            performance.getEntriesByType('navigation'),
            performance.getEntriesByType('resource')
        ];
    };
    // 做只有一次的工作，比如记录下浏览器信息、设置全部错误捕捉等。
    Watcher.prototype.doOnce = function () {
        var _this = this;
        var _a;
        var browserInfo = {};
        (_a = window.navigator, browserInfo.platform = _a.platform, browserInfo.userAgent = _a.userAgent);
        this.browserInfo = browserInfo;
        var oldErrorHandle = window.onerror || noop;
        window.onerror = function (msg, url, lineNo, columnNo, error) {
            var string = msg.toLowerCase();
            var substring = 'script error';
            if (string.indexOf(substring) > -1) { // 跨域脚本出错
                console.log('Script Error: See Browser Console for Detail');
            }
            else {
                var message = [
                    'Message: ' + msg,
                    'URL: ' + url,
                    'Line: ' + lineNo,
                    'Column: ' + columnNo,
                    'Error object: ' + JSON.stringify(error)
                ].join('\n');
                _this._errorMsg = message;
                _this._sendType = CONSTANTS.ERROR;
                _this.sendBuf();
            }
            return oldErrorHandle(msg, url, lineNo, columnNo, error);
        };
    };
    Watcher.compute = function (performanceResourceTiming) {
        console.log('performanceResourceTiming: ', performanceResourceTiming);
        var domainLookupStart = performanceResourceTiming.domainLookupStart, domainLookupEnd = performanceResourceTiming.domainLookupEnd, duration = performanceResourceTiming.duration, url = performanceResourceTiming.name, responseStart = performanceResourceTiming.responseStart, responseEnd = performanceResourceTiming.responseEnd;
        duration = Watcher.getShortS("" + duration);
        console.log('duration: ', duration);
        var dnsTime = Watcher.getShortS("" + (domainLookupEnd - domainLookupStart));
        var responseTime = Watcher.getShortS("" + (responseEnd - responseStart));
        return {
            dnsTime: dnsTime,
            duration: duration,
            url: url,
            responseTime: responseTime,
        };
    };
    Watcher.prototype.getLatestEntries = function (list) {
        var _this = this;
        var _a;
        clearTimeout(Watcher.updateTimer);
        var entriesList = list.getEntriesByType('resource');
        entriesList = entriesList.filter(function (item) { return item.name.indexOf(Watcher.watcherUrl) === -1; });
        if (entriesList.length > 0) {
            (_a = Watcher._tempResource).push.apply(_a, entriesList);
            Watcher.updateTimer = setTimeout(function () {
                _this._entriesResource = Watcher._tempResource;
                // 清空
                Watcher._tempResource = [];
                _this._sendType = CONSTANTS.LOAD_RESOURCE;
                _this.sendBuf();
            }, 1000);
        }
    };
    Watcher.getShortS = function (str) {
        return str.slice(0, 8);
    };
    Watcher.prototype.sendBuf = function () {
        var data = {};
        switch (this._sendType) {
            case CONSTANTS.FIRST_PAGE:
                data.browserInfo = this.browserInfo;
                data.type = CONSTANTS.FIRST_PAGE;
                data.pageLoad = Watcher.compute(this._entriesPageLoad[0]);
                data.resource = this._entriesResource.map(Watcher.compute);
                break;
            case CONSTANTS.LOAD_RESOURCE:
                data.type = CONSTANTS.LOAD_RESOURCE;
                data.resource = this._entriesResource.map(Watcher.compute);
                break;
            case CONSTANTS.ERROR:
                data.error = this._errorMsg;
                data.browserInfo = this.browserInfo;
                data.type = CONSTANTS.ERROR;
                break;
            default:
                break;
        }
        fetch(Watcher.watcherUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            credentials: 'omit',
            body: JSON.stringify(data)
        });
    };
    Watcher.start = function () {
        var rest = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            rest[_i] = arguments[_i];
        }
        return new (Watcher.bind.apply(Watcher, [void 0].concat(rest)))();
    };
    Watcher._tempResource = [];
    return Watcher;
}());

module.exports = Watcher;
//# sourceMappingURL=dev.fe-timeline-watcher.js.map
