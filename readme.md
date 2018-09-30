用于前端加载资源时的性能监控及错误上报。

# 使用方法

## script引入
直接将min.js文件放入html中
```html
    <script src="path/to/fe-timeline-watcher.min.js"></script>
    <script>
        __FE_TIMELINE_WATCHER__.start(
            watcherUrl: string,
            needResourceInfo?: boolean = true,
            needPageLoadInfo?: boolean = true,
            needErrorInfo?: boolean = true
        );
    </script>
```

## cjs引入
```js
    var Watcher = require('fe-timeline-watcher');
    Watcher.start(
        watcherUrl: string,
        needResourceInfo?: boolean = true,
        needPageLoadInfo?: boolean = true,
        needErrorInfo?: boolean = true
    );
```

# 注意事项
监控请求采用fetch（低端浏览器请自行polyfill），数据为post请求。