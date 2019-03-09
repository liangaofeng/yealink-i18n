import {ErrorResponse} from "../models";
import {IRole, ROLE_TYPE} from "../types/";
import User from "../repository/entity/User";

abstract class Role {
    public static getRoleLabel(role: number) {
        for (const key in ROLE_TYPE) {
            if (Object.prototype.toString.call(ROLE_TYPE[key]) === '[object Object]') {
                if (role === ROLE_TYPE[key].value) {
                    return ROLE_TYPE[key].label;
                }
            }
        }
        return '未知';
    }
}

/**
 * 权限处理
 * @param role 角色
 * @constructor
 */
const Power = (role: IRole = ROLE_TYPE.ROOT): Function => {
    return function (_target, _name, descriptor) {
        const fn = descriptor.value;
        descriptor.value = async function (req, res) {
            if (!req.session || !req.session.user) {
                let {username, password} = req.body;
                if (!username) {
                    username = req.query.username;
                }
                if (!password) {
                    password = req.query.password;
                }
                const user = await User.login(username, password);
                if (username && password && user && user.username) {
                    req.session.user = user;
                } else {
                    return res.status(401).json(new ErrorResponse(`用户账号已过期`));
                }
            }
            const user = req.session.user;
            if (!user.role || user.role < role.value) {
                return res.json(new ErrorResponse(`无权操作，当前用户角色为：${Role.getRoleLabel(user.role)}`));
            }
            return await fn.call(this, req, res);
        };
    };
};

export default Power;