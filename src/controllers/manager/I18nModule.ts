import {Response, Request} from "express";
import {Controller, Res, Req, Post} from "routing-controllers";
import {ok} from "assert";

import Config from '../../config';
import {I18n, Project} from "../../repository";
import {Logger, Power} from '../../middlewares';
import Utils from '../../utils/index';
import {BaseResponse, ListResponse} from '../../models';
import {LOGGER_OPERATE, ROLE_TYPE} from "../../types";
import {II18nDocument, II18nSync} from "../../repository/entity/I18n";
import Excel from "../../utils/Excel";
import ListPidRequest from "../../models/request/ListPidRequest";

@Controller("/manager/i18n")
export class I18nModuleController {
    /**
     * @api {post} /api/manager/i18n/list 国际化列表
     * @apiDescription 国际化模块
     * @apiName list 国际化列表
     * @apiGroup Manager
     * @apiParam {string} key 关键字
     * @apiParam {string} desc 排序类型
     * @apiParam {string} order 排序字段
     * @apiParam {number} limit 页数
     * @apiParam {number} skip 页码
     * @apiParam {string} pid PID
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
        const result = await I18n.list(new ListPidRequest(req.body));
        return res.json(new ListResponse(result));
    }

    /**
     * @api {post} /api/manager/i18n/value/update 国际化修改
     * @apiDescription 国际化模块
     * @apiName value/update 国际化修改
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
     * @apiSampleRequest /api/manager/i18n/value/update
     * @apiVersion 1.0.0
     */
    @Post("/value/update")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.UPDATE_I18N, {T: `将国际化 ：<%= oldValue %> （key:<%= key %>） 修改为 ：<%= newValue %> , 语言：<%= lang %> 同步更新了：<%= sync %> `})
    public async updateValue(@Req() req: Request, @Res() res: Response) {
        let {_id, lang, value, pid} = req.body;
        value = value && value.toString() || '';
        const i18n = await I18n.findOne({_id});
        ok(i18n, 'KEY不存在');
        i18n.values[lang] = value;
        i18n.markModified(`values.${lang}`);
        const result = await i18n.save();

        const syncResult = (await I18n.sync(<II18nSync>{pid, lang, _id})) || [];

        //日志处理
        req['setLogger'] && req['setLogger']({
            oldValue: i18n.values[lang] || '',
            newValue: value,
            lang,
            key: i18n.key,
            sync: syncResult.map(x => x.key).join(',')
        });

        return res.json(new BaseResponse<II18nDocument>(result));
    }

    /**
     * @api {post} /api/manager/i18n/delete 国际化删除
     * @apiDescription 国际化模块
     * @apiName delete 国际化删除
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
     * @apiSampleRequest /api/manager/i18n/delete
     * @apiVersion 1.0.0
     */
    @Post("/delete")
    @Power(ROLE_TYPE.ADMIN)
    @Logger(LOGGER_OPERATE.DELETE_I18N, {T: `删除国际化 ：<%= zh %> （key:<%= key %>） `})
    public async delete(@Req() req: Request, @Res() res: Response) {
        const {_id} = req.body;
        const i18n = await I18n.findById(_id);
        ok(i18n, 'I18n不存在');

        const result = await I18n.deleteOne({_id});

        req['setLogger'] && req['setLogger']({
            zh: i18n.values['zh'] || '',
            key: i18n.key
        });

        return res.json(new BaseResponse<II18nDocument>(result));
    }

    /**
     * @api {post} /api/manager/i18n/create 国际化添加
     * @apiDescription 国际化模块
     * @apiName create 国际化添加
     * @apiGroup Manager
     * @apiParam {string} title 中文
     * @apiParam {string} key  key值
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/i18n/create
     * @apiVersion 1.0.0
     */
    @Post("/create")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.ADD_I18N, {T: `新增国际化 ：中文 <%= title %> （key:<%= key %>）`})
    public async create(@Req() req: Request, @Res() res: Response) {
        const {title, key, pid} = req.body;
        const project = await Project.findByPid(pid);
        ok(project, '项目不存在');
        req.body.username = req.session.user.username;
        Utils.setEmptyFields(req.body, 'values');
        const i18n = new I18n(req.body);
        ok(!await I18n.findByKey(key), 'Key已存在');
        const defaultLang = Config.languages.find(x => x.default);
        i18n.values[defaultLang.lang] = title;
        const result = await i18n.save();
        return res.json(new BaseResponse<II18nDocument>(result));
    }

    /**
     * @api {post} /api/manager/i18n/import 国际化导入
     * @apiDescription 国际化模块
     * @apiName import 国际化导入
     * @apiGroup Manager
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/i18n/import
     * @apiVersion 1.0.0
     */
    @Post("/import")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.IMPORT_I18N, {T: `导入国际化 `})
    public async importKey(@Req() req: Request, @Res() res: Response) {
        const excel = new Excel();
        const workbook = await excel.save(req);
        const excelI18ns = excel.init(workbook).toJson();
        const pid = req.query.pid;
        const [project, dbI18ns] = await Promise.all([Project.findByPid(pid), I18n.findByPid(pid)]);
        ok(project, '项目不存在');
        const dbI18nMap = Utils.createMap(dbI18ns, 'key');
        const {languages} = project;
        //需要新增的
        const newKeys = [];
        const updateKeys = [];
        const date = new Date();
        const seconds = date.getSeconds();
        for (const [module, i18ns] of Object.entries(excelI18ns)) {
            i18ns.forEach(row => {
                if (dbI18nMap.hasOwnProperty(row.key)) {
                    const oldDbI18n = dbI18nMap[row.key];
                    if (oldDbI18n['_id']) {//数据库里面的数据，非现在导入的
                        for (let i = 0; i < languages.length; i++) {
                            const lang = languages[i].lang;
                            if (oldDbI18n.values[lang] !== (row[lang] || '')) { // != 不要用
                                row._id = oldDbI18n._id;
                                updateKeys.push(row);
                                break;
                            }
                        }
                    }
                } else {
                    const newItem: any = {key: row.key, module, values: {}, pid, _count: 0};
                    languages.forEach(({lang}) => {
                        if (!row[lang]) {
                            newItem._count++;
                        }
                        newItem.values[lang] = row[lang] || '';
                    });
                    if (newItem._count) {
                        newItem.updatedAt = date.setSeconds(seconds + newItem._count);
                    }
                    newKeys.push(newItem);
                    dbI18nMap[newItem.key] = newItem;
                }
            });
        }

        req['setLogger'] && req['setLogger']({
            newI18n: newKeys,
            updateI18n: updateKeys
        });

        Promise.all([I18n.insertMany(newKeys), I18n.updateValueMany(updateKeys, languages)]).then(() => {
            return res.json(new BaseResponse({
                newKeys: newKeys.length,
                updateKeys: updateKeys.length
            }));
        });
    };

    /**
     * @api {post} /api/manager/i18n/export 国际化导出
     * @apiDescription 国际化模块
     * @apiName export 国际化导出
     * @apiGroup Manager
     * @apiParam {string} pid PID
     * @apiParam {Boolean} all 是否全部导出，或者导出未翻译
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/i18n/export
     * @apiVersion 1.0.0
     */
    @Post("/export")
    @Power(ROLE_TYPE.REPORTER)
    @Logger(LOGGER_OPERATE.SPECIAL_EXPORT_I18N, {T: `导出国际化 `})
    public async exportKey(@Req() req: Request, @Res() res: Response) {
        const pid = req.body.pid;
        const project = await Project.findByPid(pid);
        ok(project, '项目不存在');
        let list = await I18n.findByPid(pid);
        if (req.body.all === false) {
            list = list.filter(x => Object.keys(x.values).some(key => !x.values[key]));
        }
        const excel = new Excel();
        const result = excel.toExcel(list, project);
        return res.json(new BaseResponse<string>(result));
    };

    /**
     * @api {get} /api/manager/i18n/merge 国际化合并
     * @apiDescription 国际化模块
     * @apiName merge 国际化合并
     * @apiGroup Manager
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/i18n/export
     * @apiVersion 1.0.0
     */
    @Post("/merge")
    @Power(ROLE_TYPE.DEVELOPER)
    public async merge(@Req() req: Request, @Res() res: Response) {
        const pid = req.body.pid;
        const project = await Project.findByPid(pid);
        ok(project, '项目不存在');
        const languages = project.languages.map(x => x.lang);
        const result = await I18n.merge({pid, languages});
        return res.json(new BaseResponse<II18nDocument[]>(result));
    };

}
