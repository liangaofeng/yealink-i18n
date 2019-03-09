import {Response, Request} from "express";
import {ok} from "assert";
import * as mongoose from 'mongoose';
import {Controller, Res, Req, Post} from "routing-controllers";

import {Special, Project} from "../../repository/index";

import I18n from "../../repository/entity/I18n";

import {Logger, Power} from '../../middlewares/';
import Utils from '../../utils/index';

import {BaseResponse, ListResponse, ListSpecialRequest} from '../../models';
import {LOGGER_OPERATE, ROLE_TYPE} from "../../types";
import {ISpecialDocument} from "../../repository/entity/Special";
import {IProjectDocument} from "../../repository/entity/Project";


@Controller("/manager/special")
export class SpecialModuleController {
    /**
     * @api {post} /api/manager/special/list 特制国际化列表
     * @apiDescription 特制模块
     * @apiName special/list 特制国际化列表
     * @apiGroup Manager
     * @apiParam {string} key 关键字
     * @apiParam {string} desc 排序类型
     * @apiParam {string} order 排序字段
     * @apiParam {string} limit 页数
     * @apiParam {string} skip 页码
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/special/list
     * @apiVersion 1.0.0
     */
    @Post("/list")
    @Power(ROLE_TYPE.VISITOR)
    public async list(@Req() req: Request, @Res() res: Response) {
        const result = await Special.list(new ListSpecialRequest(req.body));
        return res.json(new ListResponse(result));
    }

    /**
     * @api {post} /api/manager/special/value/update 特制国际化修改
     * @apiDescription 特制模块
     * @apiName special/value/update 特制国际化修改
     * @apiGroup Manager
     * @apiParam {string} _id 国际化id
     * @apiParam {string} lang 修改值的语言
     * @apiParam {string} value 修改值
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/special/value/update
     * @apiVersion 1.0.0
     */
    @Post("/value/update")
    @Power(ROLE_TYPE.REPORTER)
    @Logger(LOGGER_OPERATE.SPECIAL_UPDATE_I18N, {T: `将国际化 ：<%= oldValue %> （key:<%= key %>） 修改为 ：<%= newValue %> , 语言：<%= lang %>  `})
    public async updateValue(@Req() req: Request, @Res() res: Response) {
        let {_id, lang, value} = req.body;
        value = value && value.toString() || '';
        const i18n = await Special.findOne({_id});
        ok(i18n, 'KEY不存在');
        req['setLogger'] && req['setLogger']({oldValue: i18n.values[lang]});
        i18n.values[lang] = value;
        i18n.markModified(`values.${lang}`);
        const result = await i18n.save();
        //日志处理
        req['setLogger'] && req['setLogger']({
            newValue: value,
            lang,
            key: i18n.key
        });
        return  res.json(new BaseResponse<ISpecialDocument>(result));
    }

    /**
     * @api {post} /api/manager/special/value/update 特制国际化修改
     * @apiDescription 特制模块
     * @apiName special/value/update 特制国际化修改
     * @apiGroup Manager
     * @apiParam {Array} specials [{value,label}] 修改值
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/special/value/update
     * @apiVersion 1.0.0
     */
    @Post("/update")
    @Power(ROLE_TYPE.REPORTER)
    @Logger(LOGGER_OPERATE.SPECIAL_UPDATE, {T: `特制国际化修改`})
    public async update(@Req() req: Request, @Res() res: Response) {
        let {pid, specials} = req.body;
        const project = await Project.findOne({pid});
        ok(project, '项目不存在');
        specials = specials.map(special => {
            if (!special || Object.prototype.toString.call(special) !== '[object Object]' || !special.value) {
                return {
                    value: new mongoose.Types.ObjectId,
                    label: typeof special === 'string' ? special : special.label
                }
            } else {
                return special;
            }
        });
        project.specials = specials;
        const result = await project.save();
        return res.json(new BaseResponse<IProjectDocument>(result));
    }

    /**
     * @api {post} /api/manager/special/delete 特制国际化删除
     * @apiDescription 特制模块
     * @apiName special/delete 特制国际化删除
     * @apiGroup Manager
     * @apiParam {string} _id 国际化id
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/special/delete
     * @apiVersion 1.0.0
     */
    @Post("/delete")
    @Power(ROLE_TYPE.ADMIN)
    @Logger(LOGGER_OPERATE.SPECIAL_DELETE_I18N, {T: `将国际化 ：<%= zh %> （key:<%= key %>） 删除 `})
    public async delete(@Req() req: Request, @Res() res: Response) {
        const {_id} = req.body;
        const i18n = await Special.findById(_id);
        ok(i18n, 'I18n不存在');

        const result = await Special.deleteOne({_id});

        req['setLogger'] && req['setLogger']({
            zh: i18n.values['zh'] || '',
            key: i18n.key
        });

        return res.json(new BaseResponse<IProjectDocument>(result));
    }

    /**
     * @api {post} /api/manager/special/create 特制国际化添加
     * @apiDescription 特制模块
     * @apiName special/create 特制国际化添加
     * @apiGroup Manager
     * @apiParam {string} special 特制版本名称
     * @apiParam {string[]} keys  要添加的keys
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/special/create
     * @apiVersion 1.0.0
     */
    @Post("/create")
    @Power(ROLE_TYPE.REPORTER)
    @Logger(LOGGER_OPERATE.SPECIAL_ADD_I18N, {T: `将国际化新增国际化 `})
    public async create(@Req() req: Request, @Res() res: Response) {
        const {special, keys, pid} = req.body;

        ok(special, '请先选择资源');
        ok(keys, 'keys不能为空');
        ok(pid, 'PID不能为空');

        const i18nKeys = await I18n.find({pid, key: {$in: keys}});
        const dcKeys = await Special.find({pid, special});
        const dcKeysSet = new Set(dcKeys.map(x => x.key));
        const newKeys = [];

        i18nKeys.forEach(i18nKey => {
            const i18nKeyObject = i18nKey.toObject();
            delete i18nKeyObject._id;
            if (!dcKeysSet.has(i18nKeyObject.key)) {
                dcKeysSet.add(i18nKeyObject.key);
                newKeys.push(Object.assign({special}, i18nKeyObject));
            }
        });

        await Special.insertMany(newKeys);

        req['setLogger'] && req['setLogger']({
            newI18n: newKeys.map(({key, values}) => {
                return JSON.stringify({
                    key,
                    values
                })
            })
        });

        return res.json(new BaseResponse({
            newKeys: newKeys.length
        }));
    }

    /**
     * @api {post} /api/manager/special/export 特制国际化导出
     * @apiDescription 特制模块
     * @apiName special/export 特制国际化导出
     * @apiGroup Manager
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/special/export
     * @apiVersion 1.0.0
     */
    @Post("/export")
    @Power(ROLE_TYPE.REPORTER)
    @Logger(LOGGER_OPERATE.SPECIAL_EXPORT_I18N, {T: `导出国际化 `})
    public async exportKey(@Req() req: Request, @Res() res: Response) {
        const {special, pid} = req.body;

        const project = await Project.findByPid(pid);
        ok(project, '项目不存在');

        const {languages} = project;

        let i18ns = await Special.find({pid, special});
        let json = {};
        languages.forEach(({lang}) => {
            json[lang] = {};
            i18ns.forEach(i18n => {
                json[lang][i18n.key] = i18n['values'][lang] || ''
            });
        });

        let content = `window.I18N = ${JSON.stringify(json)};`;
        //TO_BACK const fileName = `${name + '_' + DateTime.uuid()}.js`;
        const result = Utils.createJsFile(content);
        return res.json(new BaseResponse<string>(result));
    };
}
