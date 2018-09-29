// custome .eslintrc , may published as package
console.log('Using custom eslintrc this time...');
console.log('Now checking...\n');
module.exports = {
    "extends": ["eslint:recommended", "@qnpm/eslint-config-qunar"],
    // "parser": "babel-eslint",
    "parser": "typescript-eslint-parser",
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "react/jsx-filename-extension": 0,
        "indent": [2, 4],
        "no-unused-vars": [2],
        "brace-style": 2,
        "no-console": 0,
        "react/jsx-equals-spacing": 0,
        "react/sort-comp": 0,
        "react/jsx-uses-vars": 2,
        "jsx-quotes": 0,
        "padded-blocks": 0,
        "jsx-a11y/anchor-is-valid": 0,
        "jsx-a11y/click-events-have-key-events": 0,
        "jsx-a11y/no-static-element-interactions": 0,
        "jsx-a11y/no-noninteractive-element-interactions": 0,
        "no-unused-expressions": ["error", {
            "allowShortCircuit": true
        }],
        "import/no-unresolved": 0,
        "import/extensions": 0,
        "no-plusplus": 0,
        "arrow-body-style": [2, "as-needed"],
        "object-curly-newline": [2, {
            "consistent": true
        }],
        "react/no-array-index-key": 0,
        "dot-notation": 0,
        "semi": 2,
        // "comma-dangle": [2, "never"], // 添加不使用尾逗号，防止sonar报错
        "import/prefer-default-export": 0,
        "prefer-arrow-callback": 0, // 取消回调必须使用箭头函数
        "prefer-promise-reject-errors": 0, // 取消promise的reject必须是Error
        "quote-props": ["error", "as-needed", {
            "unnecessary": false
        }],
        "camelcase": [2, {
            properties: "never"
        }],
        "react/no-did-mount-set-state": 0,
        "react/no-did-update-set-state": 0,
        "react/forbid-prop-types": 1,
        "import/first": 1,
        "arrow-parens": 1,
        "prefer-template": 0,
        "prefer-rest-params": 0
    },
    "env": {
        "browser": true,
        "node": true,
        "es6": true
    }
}