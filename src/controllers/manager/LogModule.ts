import {Response, Request} from "express";
import {Controller, Res, Req, Post} from "routing-controllers";

import Log from "../../repository/entity/Log";
import {Power} from '../../middlewares/';
import {ListResponse} from '../../models';
import {ROLE_TYPE} from "../../types";
import ListLogRequest from "../../models/request/ListLogRequest";


@Controller("/manager/log")
export class LogModuleController {
    /**
     * @api {post} /api/manager/log/list 日志列表
     * @apiDescription 日志模块
     * @apiName log/list 日志列表
     * @apiGroup Manager
     * @apiParam {string} key 关键字
     * @apiParam {string} desc 排序类型
     * @apiParam {string} order 排序字段
     * @apiParam {string} limit 页数
     * @apiParam {string} skip 页码
     * @apiParam {string} pid PID
     * @apiParam {string} operate " LOGIN: '登录',INIT_FRONT_PROJECT: '前端初始化项目',  ADD_I18N: '新增国际化', UPDATE_I18N: '更新国际化',  DELETE_I18N: '删除国际化',  IMPORT_I18N: '导入国际化', EXPORT_I18N: '导出国际化',SPECIAL_UPDATE: '新增特制版本',SPECIAL_ADD_I18N: '新增国际化(特制版本)',SPECIAL_UPDATE_I18N: '更新国际化(特制版本)', SPECIAL_DELETE_I18N: '删除国际化(特制版本)',SPECIAL_IMPORT_I18N: '导入国际化(特制版本)',SPECIAL_EXPORT_I18N: '导出国际化(特制版本)',BACK_UP: '备份',RESTORE: '还原', ADD_PROJECT: '新增项目', UPDATE_PROJECT: '更新项目',DELETE_PROJECT: '删除项目',  PUBLIC: '普通操作'"
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/i18n/list
     * @apiVersion 1.0.0
     */
    @Post("/list")
    @Power(ROLE_TYPE.VISITOR)
    public async list(@Req() req: Request, @Res() res: Response) {
        const result = await Log.list(new ListLogRequest(req.body));
        return res.json(new ListResponse(result));
    }
}
