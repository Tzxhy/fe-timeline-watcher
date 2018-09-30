function appendImg(src) {
    var ele = document.createElement('img');
    ele.src = src;
    ele.width = 100;
    ele.alt = '测试图片';
    document.body.appendChild(ele);
}