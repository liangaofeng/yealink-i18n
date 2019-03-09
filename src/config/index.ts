export default {
    "database": {
        "name": "i18n",
        "url": "mongodb://localhost/"
    },
    "languages": [
        {
            "fileName": "zh.js",
            "lang": "zh",
            "label": "简体中文",
            "value": "zh",
            "display": true,
            "default": true
        },
        {
            "fileName": "en.js",
            "lang": "en",
            "label": "English",
            "value": "en",
            "display": true,
            "default": true
        },
        {
            "fileName": "tw.js",
            "lang": "tw",
            "label": "繁體中文",
            "value": "tw",
            "display": true,
            "default": false
        },
        {
            "fileName": "ru.js",
            "lang": "ru",
            "label": "Русский",
            "value": "ru",
            "display": true,
            "default": false
        },
        {
            "fileName": "pt.js",
            "lang": "pt",
            "label": "Português",
            "value": "pt",
            "display": true,
            "default": false
        },
        {
            "fileName": "pl.js",
            "lang": "pl",
            "label": "Polski",
            "value": "pl",
            "display": true,
            "default": false
        },
        {
            "fileName": "es.js",
            "lang": "es",
            "label": "Español",
            "value": "es",
            "display": true,
            "default": false
        },
        {
            "fileName": "jp.js",
            "lang": "jp",
            "label": "日本語",
            "value": "jp",
            "display": true,
            "default": false
        }
    ],
    "cacheFolder": ".data",
    "projectFolder": ".project",
    "defaultChineseLang": "zh",
    "ldap": {
        "enable": false,
        "connect": "ldap://192.168.1.1"
    }
}
