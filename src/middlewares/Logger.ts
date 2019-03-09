import * as  _ from 'lodash';
import Log from '../repository/entity/Log';
import LOGGER_OPERATE from '../types/LOGGER_OPERATE';

/***
 * 日志处理
 * @param operate 操作类型
 * @param T 显示模板
 * @param TF 渲染模板函数
 * @param saved 是否被保存
 * @constructor Logger
 */
const Logger = (operate: LOGGER_OPERATE = LOGGER_OPERATE.PUBLIC, {T = null, TF = null, saved = true} = {}): Function => {
    return function (_target, _name, descriptor) {
        const fn = descriptor.value;
        descriptor.value = async function (req, res, next) {
            if (!saved) {
                await fn.call(this, req, res, next);
            } else {
                //同步执行完成后，获取req.logger, 执行写入数据库
                const pid = _.get(req, 'body.pid', null);
                const detail = TF && TF.apply(null, req) || req.body || {};

                req.log = new Log({operate, pid});
                req.setLogger = p => Object.assign(detail, p);
                req.saveLogger = async () => {
                    req.log.username = _.get(req, 'session.user.username', null) || req.body.username;
                    req.log.detail = typeof T === 'string' ? _.template(T)(detail) : detail;
                    return req.log.save();
                };

                try {
                    return await fn.call(this, req, res, next);
                }catch (e) {
                    console.error(e);
                    req.log.result = 'FAIL';
                    req.log.reason = e.message || e.toString();
                    throw new Error(req.log.reason);
                }finally {
                    setImmediate(req.saveLogger);
                }
            }
        };
    };
};

export default Logger;