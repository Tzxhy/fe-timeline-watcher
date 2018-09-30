var expect = require('chai').expect;

var Watcher = require('../dist/dev.fe-timeline-watcher.js');

describe('测试基本构造', function(){

    before(function(){
        require('./helpers/initBrowserEnv.js');
        
    });


    it('测试环境', function() {
        var watcher = Watcher.start('localhost');
        console.log('watcher: ', watcher);
        expect(1).to.be.equal(1);
    });

});