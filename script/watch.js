/*
* @Author: 谭智轩
* @Date:   2018-09-28 20:03:18
* @Last Modified by:   谭智轩
* @Last Modified time: 2018-09-29 11:17:37
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
    input: 'index.ts',
    plugins: [
        resolve(),
        commonjs(),
        typescript(),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        }),
        
        
    ],
    output: {
        file: 'dev/bundle.[hash:8].js',
        sourcemap: true,
        format: 'iife',
        name: '__hhh'
    },
    watch: {
        include: 'index.ts'
    }
};





const bundleDev = rollup.watch(inputOptions);
bundleDev.on('event', (event) => {
    console.log('event: ', event);
});


