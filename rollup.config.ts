import typescript from "rollup-plugin-typescript2";
const dts = require('rollup-plugin-dts')

export default function () {
    // const isDev = !!commandArgs.watch;
    let isDev = arguments[0].watch ? true : false;
    const rollupOptions = [{
        input: './src/index.ts',
        output: [
            {
                file: "dist/index.cjs.js",
                format: "cjs",
            },
            {
                file: "dist/index.esm.js",
                format: "es",
            },
            {
                file: "dist/index.umd.js",
                format: "umd",
                name: 'Mark'
            },

        ],
        plugins: [
            typescript({
                exclude: "node_modules/**",
                tsconfig: "tsconfig.node.json",
                useTsconfigDeclarationDir: true,
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: !isDev,
                        declarationDir: !isDev ? './types' : undefined,
                        sourceMap: !isDev
                    }
                }
            }),
        ],
    }];
    if (!isDev) {
        rollupOptions.push({
            input: "./types/src/index.d.ts",
            output: [
                {
                    file: "./dist/index.d.ts",
                    format: "es",
                },
            ],
            plugins: [dts.default()],
        })
    }

    return rollupOptions
};