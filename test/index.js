/*
* @Author: 谭智轩
* @Date:   2018-09-30 11:21:10
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-30 14:00:14
* @email: zhixuan.tan@qunar.com
*/
module.exports = {
  'Test Google' : function (browser) {
    browser
      .url('http://100.80.180.183:53658/')
      .waitForElementVisible('body', 1000)
      .assert.containsText('h1', '自动化测试')
      .waitForElementVisible('img', 2000)
      .getLog('browser', function(typesArray) {
        console.log('typesArray', typesArray);
      })
      .pause(100000)
      .end();
  }
};