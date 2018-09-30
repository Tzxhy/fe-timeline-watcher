var expect = require('chai').expect;



describe('测试基本构造', function(){
    var Watcher;
    before(function(){
        require('./helpers/initBrowserEnv.js');
        Watcher = require('../dist/dev.fe-timeline-watcher.js');
    });


    it('测试环境', function() {
        var watcher = new Watcher('localhost');
        expect(1).to.be.equal(1);
    });

});