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
    CONSTANTS[CONSTANTS["CUSTOM_DATA"] = 3] = "CUSTOM_DATA";
})(CONSTANTS || (CONSTANTS = {}));
var Watcher = /** @class */ (function () {
    function Watcher(watcherUrl, needResourceInfo, needPageLoadInfo, needErrorInfo) {
        var _a;
        if (needResourceInfo === void 0) { needResourceInfo = true; }
        if (needPageLoadInfo === void 0) { needPageLoadInfo = true; }
        if (needErrorInfo === void 0) { needErrorInfo = true; }
        var _this = this;
        if (!watcherUrl) {
            throw new Error("\u6784\u9020\u51FD\u6570\u9700\u8981\u63A5\u6536watcherUrl\u53C2\u6570\uFF01");
        }
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
        Watcher.watcherUrl = watcherUrl;
        this._sendType = CONSTANTS.FIRST_PAGE;
        this._hasReadIndex = 0;
        this._messageBuf = [];
        this.doOnce();
        // 初始化Performance监察者对象
        // const self: any = this;
        // console.log('document.readyState: ', document.readyState);
        if (document.readyState !== 'complete') {
            var oldOnload_1 = window.onload || noop;
            window.onload = function (e) {
                setTimeout(function () {
                    var _a;
                    _a = Watcher.getFirstEntries(), _this._entriesPageLoad = _a[0], _this._entriesResource = _a[1];
                    // console.log('this._entriesPageLoad: ', this._entriesPageLoad);
                    _this._hasReadIndex = 0;
                    _this.sendData();
                }, 0);
                return oldOnload_1.bind(e).call(e);
            };
        }
        else {
            _a = Watcher.getFirstEntries(), this._entriesPageLoad = _a[0], this._entriesResource = _a[1];
            this._hasReadIndex = 0;
            this.sendData();
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
                _this.sendData();
            }
            return oldErrorHandle(msg, url, lineNo, columnNo, error);
        };
    };
    Watcher.compute = function (performanceResourceTiming) {
        // console.log('performanceResourceTiming: ', performanceResourceTiming);
        var domainLookupStart = performanceResourceTiming.domainLookupStart, domainLookupEnd = performanceResourceTiming.domainLookupEnd, duration = performanceResourceTiming.duration, url = performanceResourceTiming.name, responseStart = performanceResourceTiming.responseStart, responseEnd = performanceResourceTiming.responseEnd;
        duration = Watcher.getShortS("" + duration);
        // console.log('duration: ', duration);
        var dnsTime = Watcher.getShortS("" + (domainLookupEnd - domainLookupStart));
        // 使用该函数计算resource资源时间responseTime，有一个前提。就是资源是同源资源或者
        // 资源响应头设置了Timing-Allow-Origin: 源或*
        // https://www.w3.org/TR/resource-timing-2/#issue-container-generatedID-1下面一点。
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
                _this.sendData();
            }, 1000);
        }
    };
    Watcher.getShortS = function (str) {
        return str.slice(0, 8);
    };
    Watcher.useOwnSender = function (sender) {
        if (!sender) {
            throw new Error("useOwnSender\u9700\u8981\u63A5\u6536\u4E00\u4E2Asender\u51FD\u6570\u4F5C\u4E3A\u53C2\u6570");
        }
        Watcher._sender = sender;
    };
    Watcher.prototype.sendData = function (cData) {
        var data = cData ? { cData: cData } : {};
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
        if (Watcher._sender) {
            Watcher._sender(data);
        }
        else {
            this.originSendData(data);
        }
    };
    Watcher.prototype.originSendData = function (data) {
        var fetchData = fetch(Watcher.watcherUrl + "?data=" + JSON.stringify(data) /*, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            credentials: 'omit',
            body: JSON.stringify(data)
        }*/);
        // if (__DEV__) {
        //     return data;
        // }
        return fetchData;
    };
    Watcher.prototype.sendCustom = function (data) {
        this._sendType = CONSTANTS.CUSTOM_DATA;
        this.sendData(data);
    };
    Watcher.start = function (watcherUrl, needResourceInfo, needPageLoadInfo, needErrorInfo) {
        if (needResourceInfo === void 0) { needResourceInfo = true; }
        if (needPageLoadInfo === void 0) { needPageLoadInfo = true; }
        if (needErrorInfo === void 0) { needErrorInfo = true; }
        return new Watcher(watcherUrl, needResourceInfo, needPageLoadInfo, needErrorInfo);
    };
    Watcher._tempResource = [];
    return Watcher;
}());

module.exports = Watcher;
