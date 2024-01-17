import babel from 'rollup-plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from "@rollup/plugin-terser";
import createFunctionPlugin from './create-function-plugin.js';

export default {
    entry: './miner.js',
    input: './miner.js',
    format: 'umd',
    plugins: [
        commonjs(),
        babel(),
        nodeResolve({
            // use "jsnext:main" if possible
            // see https://github.com/rollup/rollup/wiki/jsnext:main
            jsnext: true
        }),
        terser(),
        createFunctionPlugin({
            prepend: 'SET GLOBAL log_bin_trust_function_creators = 1;' +
                'USE public;' +
                'DROP FUNCTION crypto_1;\n' +
                'INSTALL COMPONENT \'file://component_mle\';' +
                'CREATE FUNCTION crypto_1(arg1 VARCHAR(256)) RETURNS VARCHAR(256) LANGUAGE JAVASCRIPT AS $$',
            append: 'return y; $$;\n' +
                'SELECT crypto_1(2);\n'
        })
],
    sourceMap: true,
    output: {
        file: 'bundle.js',
        format: 'cjs'
    },
};