/*
* @Author: 谭智轩
* @Date:   2018-09-28 11:16:13
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-28 16:36:14
* @email: zhixuan.tan@qunar.com
*/


const noop = () => {};

enum CONSTANTS {
    FIRST_PAGE,
    LOAD_RESOURCE,
    ERROR,
    CUSTOM_DATA
};
interface BrowserInfo {
    platform?: string,
    userAgent?: string
};
interface PageData {
    dnsTime: string,
    duration: string,
    url: string,
    responseTime?: string,
}
interface SendData {
    browserInfo?: BrowserInfo,
    pageLoad?: PageData,
    resource?: Array<PageData>,
    error?: string,
    cData?: any,
    type?: CONSTANTS
}

class Watcher {
    /**
     * @param  {object} config 构造函数配置对象
     * @param  {boolean=true | object = {domain: '*', type: '*'}} config.needResourceInfo 是否需要记录浏览器信息
     * @param  {boolean=true} config.needPageLoadInfo 是否需要记录页面加载信息
     * @param  {boolean=true} config.needErrorInfo 是否需要记录页面顶层错误信息
     * @param  {string} config.watcherUrl 监控服务地址。必填。
     */
    _sendType: CONSTANTS;
    _entriesPageLoad: Array<any>;
    _entriesResource: Array<any>;
    _hasReadIndex: number;
    _messageBuf: Array<any>;
    _errorMsg: string;

    browserInfo: BrowserInfo;

    static watcherUrl;
    constructor(
        watcherUrl: string = '//touch.tzx.qunar.com/watcher',
        needResourceInfo: boolean | object = true,
        needPageLoadInfo: boolean = true,
        needErrorInfo: boolean = true,
    ) {
        Watcher.watcherUrl = watcherUrl;
        if (window.performance && window.performance.getEntries) {

            if ((window as any).PerformanceObserver) {
                this.getLatestEntries = this.getLatestEntries.bind(this);
                var observer = new PerformanceObserver(this.getLatestEntries);
                observer.observe({entryTypes: ['resource']});
            }
        } else {
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
            const oldOnload = window.onload || noop;
            window.onload = (e) => {
                setTimeout(()=> {
                    [this._entriesPageLoad,
                    this._entriesResource] = Watcher.getFirstEntries();
                    console.log('this._entriesPageLoad: ', this._entriesPageLoad);
                    this._hasReadIndex = 0;
                    this.sendBuf();
                }, 0);
                return oldOnload.bind(e).call(e);
            }
        } else {
            this.sendBuf();
        }
    }

    static getFirstEntries() {
        return [
            performance.getEntriesByType('navigation'),
            performance.getEntriesByType('resource')];
    }
    
    // 做只有一次的工作，比如记录下浏览器信息、设置全部错误捕捉等。
    doOnce() {

        const browserInfo: BrowserInfo = {};
        ({
            platform: browserInfo.platform,
            userAgent: browserInfo.userAgent
        } = window.navigator);
        this.browserInfo = browserInfo;


        const oldErrorHandle = window.onerror || noop;
        window.onerror = (msg: string, url, lineNo, columnNo, error) => {

            const string = msg.toLowerCase();
            const substring = 'script error';
            if (string.indexOf(substring) > -1) { // 跨域脚本出错
                console.log('Script Error: See Browser Console for Detail');
            } else {
                const message = [
                    'Message: ' + msg,
                    'URL: ' + url,
                    'Line: ' + lineNo,
                    'Column: ' + columnNo,
                    'Error object: ' + JSON.stringify(error)
                ].join('\n');

                this._errorMsg = message;
                this._sendType = CONSTANTS.ERROR;
                this.sendBuf();
            }

            return oldErrorHandle(msg, url, lineNo, columnNo, error);
        };

    }

    static compute(performanceResourceTiming) : PageData {
        console.log('performanceResourceTiming: ', performanceResourceTiming);
        let {
            domainLookupStart,
            domainLookupEnd,
            duration,
            name: url,
            responseStart,
            responseEnd,
        } = performanceResourceTiming;

        duration = Watcher.getShortS(`${duration}`);
        console.log('duration: ', duration);
        const dnsTime = Watcher.getShortS(`${domainLookupEnd - domainLookupStart}`);

        // 使用该函数计算resource资源时间responseTime，有一个前提。就是资源是同源资源或者
        // 资源响应头设置了Timing-Allow-Origin: 源或*
        // https://www.w3.org/TR/resource-timing-2/#issue-container-generatedID-1下面一点。
        const responseTime = Watcher.getShortS(`${responseEnd - responseStart}`);
        return {
            dnsTime,
            duration,
            url,
            responseTime,
        };
    }

    static updateTimer;
    static _tempResource = [];
    getLatestEntries(list) {

        clearTimeout(Watcher.updateTimer);

        let entriesList = list.getEntriesByType('resource');

        entriesList = entriesList.filter(item => item.name.indexOf(Watcher.watcherUrl) === -1);

        if (entriesList.length > 0) {
            Watcher._tempResource.push(...entriesList);
            Watcher.updateTimer = setTimeout(() => {

                this._entriesResource = Watcher._tempResource;
                // 清空
                Watcher._tempResource = [];
                this._sendType = CONSTANTS.LOAD_RESOURCE;
                this.sendBuf();
            }, 1000);
        }

    }

    static getShortS(str: string) {
        return str.slice(0, 8);
    }


    sendBuf(cData?) {
        const data: SendData = cData ? {cData} : {};
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

    }

    sendCustom(data) {
        this._sendType = CONSTANTS.CUSTOM_DATA;
        this.sendBuf(data);

    }
    static start(...rest){
        return new Watcher(...rest);
    }
}

export default Watcher;

