
if (process.env.NODE_ENV === 'production') {
    module.exports = require('./dist/fe-timeline-watcher.min.js');
} else {
    module.exports = require('./dist/dev.fe-timeline-watcher.js');
}
