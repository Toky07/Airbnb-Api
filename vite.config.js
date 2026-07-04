"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
const shared = {
    globals: true,
    setupFiles: ['./src/test/vitest.setup.ts'],
    pool: 'threads',
    deps: {
        optimizer: {
            ssr: {
                enabled: true,
            },
        },
    },
};
exports.default = (0, config_1.defineConfig)({
    plugins: [],
    test: {
        projects: [
            {
                extends: true,
                test: {
                    ...shared,
                    name: 'unit',
                    setupFiles: [
                        './src/test/vitest.setup.ts',
                        './src/test/vitest.unit.setup.ts',
                    ],
                    include: ['src/**/*.spec.ts'],
                    exclude: ['**/*.controller.spec.ts'],
                    isolate: false,
                },
            },
            {
                extends: true,
                test: {
                    ...shared,
                    name: 'e2e',
                    include: ['**/*.controller.spec.ts'],
                    isolate: true,
                    fileParallelism: true,
                },
            },
        ],
    },
});
//# sourceMappingURL=vite.config.js.map