module.exports = {
    extends: [
        'eslint:recommended',
        // 'prettier',
    ],
    parser: '@babel/eslint-parser',
    env: {
        browser: true,
        es6: true,
    },
    parserOptions: {
        requireConfigFile: false,
    },
};
