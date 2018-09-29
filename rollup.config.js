// rollup.config.js
import babel from 'rollup-plugin-babel';
// import resolve from 'rollup-plugin-node-resolve';
import minify from 'rollup-plugin-babel-minify';
import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'index.ts',
    output: {
        file: 'dist/bundle.js',
        name: 'hhh',
        format: 'iife'
    },
    plugins: [
        // resolve(),
        typescript(),
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        }),
        minify({
            comments: false,
            banner: '// 这是一个测试哈',
            bannerNewLine: true
        })
    ]
};