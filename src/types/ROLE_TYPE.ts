export interface IRole {
    value: number,
    label: string
}

const ROLE_TYPE = {
    VISITOR: {
        value: 1,
        label: '访客'
    },
    REPORTER: {
        value: 2,
        label: '报告者'
    },
    DEVELOPER: {
        value: 3,
        label: '开发人员'
    },
    ADMIN: {
        value: 4,
        label: '普通管理员'
    },
    ROOT: {
        value: 5,
        label: '超级管理员'
    }
};

export default ROLE_TYPE;