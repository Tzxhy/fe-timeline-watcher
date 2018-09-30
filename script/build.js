/*
* @Author: 谭智轩
* @Date:   2018-09-28 20:03:18
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-30 18:09:42
* @email: zhixuan.tan@qunar.com
*/
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const minify = require('rollup-plugin-babel-minify');
const typescript = require('rollup-plugin-typescript2');

const rollup = require('rollup');
// see below for details on the options
const inputOptions = {
    input: 'Watcher.ts',
    plugins: [
        resolve(),
        commonjs(),
        typescript(),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        }),
        
        
    ]
};

const outputOptions = {
    file: 'dist/bundle.[hash:8].js',
};


const linkInputOptions = {
    ...inputOptions,
    plugins: [...inputOptions.plugins, minify({
        comments: false,
        banner: '// 这是一个测试哈',
        bannerNewLine: true
    })]
};
const linkOutputOptions = {
    ...outputOptions,
    file: 'dist/fe-timeline-watcher.min.js',
    name: '__FE_TIMELINE_WATCHER__',
    format: 'iife'
};

const devInputOptions = {
    ...inputOptions,
    plugins: [...inputOptions.plugins, ]
};
const devOutputOptions = {
    ...outputOptions,
    file: 'dist/dev.fe-timeline-watcher.js',
    sourcemap: false,
    name: 'fe-timeline-watcher',
    format: 'cjs'
};



async function build() {
  // create a bundle
  const bundleLink = await rollup.rollup(linkInputOptions);
  await bundleLink.write(linkOutputOptions);

  const bundleDev = await rollup.rollup(devInputOptions);
  await bundleDev.write(devOutputOptions);


}

build();

