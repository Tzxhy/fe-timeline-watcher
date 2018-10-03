用于前端页面及资源加载的性能监控及错误上报（依赖Performance API）。
告别繁杂配置，只需短短几行，即可看到效果。

## 使用方法

### script引入
直接将min.js文件放入html中，并加一行配置（并启动）。
```html
    <script src="path/to/fe-timeline-watcher.min.js"></script>
    <script>
        __FE_TIMELINE_WATCHER__.start(
            watcherUrl: string, // 必填参数
            needResourceInfo?: boolean = true, // 是否需要资源加载信息
            needPageLoadInfo?: boolean = true, // 是否需要首屏加载信息
            needErrorInfo?: boolean = true // 是否需要全局错误捕获
        );
    </script>
```

### 在webpack、rollup等配置下引入
```js
    const Watcher = require('fe-timeline-watcher');
    Watcher.start(
        watcherUrl: string,
        needResourceInfo?: boolean = true,
        needPageLoadInfo?: boolean = true,
        needErrorInfo?: boolean = true
    );
```

### 相关API
#### Watcher.start(...rest)
全等于new Watcher(...rest)

#### Watcher.useOwnSender(sender)
sender = function(data) {
    fetch(...);
}
使用自定义的函数发送请求

#### Watcher.prototype.sendCustom(data)
发送自定义数据（自定义的数据键名为cData）。

## 注意事项
1. 监控默认请求采用 _fetch_（低版本浏览器需polyfill）， **在数据量不大的情况下使用GET请求，反之使用POST** 。
2. 当需要捕获全局错误时，请务必保持所有 **跨域** script脚本含有 _crossorigin_ 属性，并且资源响应头含有正确的 _Access-Control-Allow-Origin_ 设置。可参考touch.qunar.com中对js资源的响应头设置。
3. 如果需要上报所有资源的加载时间，需要给资源的响应头设置 _Allow-Timing-Origin_ 为正确的值，否则有部分计算值不正确。

## 常见问题
Q: 请求发出后，network中查看到该请求无body？
A: 可能存在跨域问题

