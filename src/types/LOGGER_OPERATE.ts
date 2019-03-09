enum LOGGER_OPERATE {
    LOGIN = '登录',
    LOGOUT = '登出',

    ADD_USER = '新增账号',
    UPDATE_USER = '更新账号',
    UPDATE_USER_PASSWORD = '更新密码',
    DELETE_USER = '删除账号',

    INIT_FRONT_PROJECT = '前端初始化项目',

    ADD_I18N = '新增国际化',
    UPDATE_I18N = '更新国际化',
    DELETE_I18N = '删除国际化',
    IMPORT_I18N = '导入国际化',
    EXPORT_I18N = '导出国际化',

    SPECIAL_UPDATE = '新增特制版本',
    SPECIAL_ADD_I18N = '新增国际化(特制版本)',
    SPECIAL_UPDATE_I18N = '更新国际化(特制版本)',
    SPECIAL_DELETE_I18N = '删除国际化(特制版本)',
    SPECIAL_IMPORT_I18N = '导入国际化(特制版本)',
    SPECIAL_EXPORT_I18N = '导出国际化(特制版本)',

    BACK_UP = '备份',
    RESTORE = '还原',

    ADD_PROJECT = '新增项目',
    UPDATE_PROJECT = '更新项目',
    DELETE_PROJECT = '删除项目',

    PUBLIC = '普通操作'
}

export default LOGGER_OPERATE;