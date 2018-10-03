var expect = require('chai').expect;

var Watcher = require('../dist/dev.fe-timeline-watcher.js');

describe('在window.onload未触发前执行（手工模拟浏览器环境）', function(){

    before(function(){
        require('./helpers/initBrowserEnv.js');
    });

    beforeEach(function(){
        document.readyState = '!complete';
    });
    afterEach(function() {
        Watcher._sender = null;
    });

    it('构造时未传递watcherUrl', function() {
        var watcher = function(){var watcher = Watcher.start(); return watcher};
        expect(watcher).to.throw(/watcherUrl参数/);
    });

    it('浏览器无Performance API', function() {

        var oldPer = window.performance;
        window.performance = null;

        var watcher = Watcher.start('localhost');
        expect(watcher).to.be.empty;

        window.performance = oldPer;
    });


    it('在load未触发时，应该没有type=0的数据', function(done) {

        var oldFetch = global.fetch;
        var data1;
        global.fetch = function(url) {
            data1 += url;
            return url;
        };

        var watcher = Watcher.start('localhost');
        // window.onload();
        setTimeout(()=>{

            expect(data1).to.not.match(/"type":0/);
            global.fetch = oldFetch;
            done();
        }, 1000);

        
    });

    it('在load触发后，应该包含type=0的数据', function(done) {

        var oldFetch = global.fetch;
        var data1;
        global.fetch = function(url) {
            data1 += url;
            return url;
        };

        var watcher = Watcher.start('localhost');
        window.onload();
        setTimeout(()=>{

            expect(data1).to.match(/"type":0/);
            global.fetch = oldFetch;
            done();
        }, 0);

        
    });

    it('发送自定义数据', function(done) {
        var flag;
        var sender = function(data) {
            if (data.cData) {

                flag = data.cData;
            }
            return data;
        }

        var watcher = Watcher.start('localhost');
        Watcher.useOwnSender(sender);
        var da = {data: 1};
        watcher.sendCustom(da);
        window.onload();
        setTimeout(() => {

            expect(flag).to.equal(da);

            done();
        }, 1000);
    });

});

describe('在window.onload触发后（手工模拟浏览器环境）', function(){

    before(function(){
        require('./helpers/initBrowserEnv.js');
    });

    beforeEach(function(){
        document.readyState = 'complete';
    });

    afterEach(function() {
        Watcher._sender = null;
    });



    it('在load触发后，应该包含type=0的数据', function(done) {

        var oldFetch = global.fetch;
        var data1;
        global.fetch = function(url) {
            data1 += url;
            return url;
        };

        var watcher = Watcher.start('localhost');
        window.onload();
        setTimeout(()=>{

            expect(data1).to.match(/"type":0/);
            global.fetch = oldFetch;
            document.readyState = '1complete';
            done();
        }, 0);

        
    });

    it('使用自定义sender', function(done) {
        var flag;
        var sender = function(data) {
            flag = true;
            return data;
        }

        var watcher = Watcher.start('localhost');
        Watcher.useOwnSender(sender);
        window.onload();
        setTimeout(() => {

            expect(flag).to.equal(true);

            done();
        }, 1000);
    });

    it('使用自定义sender，未传sender', function(done) {
        var flag;
        var sender = function(data) {
            flag = true;
            return data;
        }

        var watcher = Watcher.start('localhost');
        var t = function() {Watcher.useOwnSender()};
        window.onload();
        setTimeout(() => {

            expect(t).to.throw(/sender函数/);

            done();
        }, 1000);
    });

    it('发送自定义数据', function(done) {
        var flag;
        var sender = function(data) {
            if (data.cData) {

                flag = data.cData;
            }
            return data;
        }

        var watcher = Watcher.start('localhost');
        Watcher.useOwnSender(sender);
        var da = {data: 1};
        watcher.sendCustom(da);
        window.onload();
        setTimeout(() => {

            expect(flag).to.equal(da);

            done();
        }, 1000);
    });


    it('捕获非跨域错误', function(done) {

        var flagMsg;
        window.onerror = function(msg) {
            if (/出错了/.test(msg)) {
                flagMsg = true;
            }
            return null;
        }
        var watcher = Watcher.start('localhost');
        window.onerror('出错了', 'localhost', 'line: 14', 'column: 21', {});
        var da = {data: 1};
        watcher.sendCustom(da);
        window.onload();

        setTimeout(() => {

            expect(flagMsg).to.equal(true);

            done();
        }, 1000);
    });


    it('捕获跨域错误', function(done) {

        var flagMsg;
        window.onerror = function(msg) {
            if (/script error/.test(msg)) {
                flagMsg = true;
            }
            return null;
        }
        var watcher = Watcher.start('localhost');
        window.onerror('script error', 'localhost', 'line: 14', 'column: 21', {});
        var da = {data: 1};
        watcher.sendCustom(da);
        window.onload();

        setTimeout(() => {

            expect(flagMsg).to.equal(true);

            done();
        }, 1000);
    })

});

