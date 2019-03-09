import {Response, Request} from "express";
import {ok, equal} from "assert";
import * as mongoose from 'mongoose';
import {Controller, Res, Get, Req, Post} from "routing-controllers";

import Project, {IProjectDocument} from "../../repository/entity/Project";
import I18n from "../../repository/entity/I18n";

import {Logger, Power} from '../../middlewares/';
import Utils from '../../utils/index';

import {BaseResponse, ListRequest, ListResponse} from '../../models';
import {LOGGER_OPERATE, ROLE_TYPE} from "../../types";
import IProjectSurveyResult from "../../models/result/interface/IProjectSurveyResult";


@Controller("/manager/project")
export class ProjectModuleController {
    /**
     * @api {post} /api/manager/project/list 项目列表
     * @apiDescription 项目模块
     * @apiName list 项目列表
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
     * @apiSampleRequest /api/manager/project/list
     * @apiVersion 1.0.0
     */
    @Post("/list")
    @Power(ROLE_TYPE.VISITOR)
    public async list(@Req() req: Request, @Res() res: Response) {
        const result = await Project.list(new ListRequest(req.body));
        return res.json(new ListResponse(result));
    }

    /**
     * @api {post} /api/manager/project/get 项目详情
     * @apiDescription 项目模块
     * @apiName get 项目详情
     * @apiGroup Manager
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/project/get
     * @apiVersion 1.0.0
     */
    @Get("/get")
    @Post("/get")
    @Power(ROLE_TYPE.VISITOR)
    public async get(@Req() req: Request, @Res() res: Response) {
        ok(req.body.pid, 'PID不能为空');
        const result = await Project.findByPid(req.body.pid);
        return res.json(new BaseResponse<IProjectDocument>(result));
    }

    /**
     * @api {post} /api/manager/project/create 项目添加
     * @apiDescription 项目模块
     * @apiName create 项目添加
     * @apiGroup Manager
     * @apiParam {string} name 项目名称
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/project/create
     * @apiVersion 1.0.0
     */
    @Post("/create")
    @Power(ROLE_TYPE.ROOT)
    @Logger(LOGGER_OPERATE.ADD_PROJECT, {T: `创建新项目 ：<%= name %>`})
    public async create(@Req() req: Request, @Res() res: Response) {
        req.body.username = req.session.user.username;
        req.body.pid = new mongoose.Types.ObjectId;
        Utils.setEmptyFields(req.body, 'pid', 'prefix', 'port');
        const project = new Project(req.body);
        ok(!await Project.findByName(project.name), '名称已存在');

        const result = await project.save();
        return res.json(new BaseResponse<IProjectDocument>(result));
    }

    /**
     * @api {post} /api/manager/project/update 项目修改
     * @apiDescription 项目模块
     * @apiName update 项目修改、编辑
     * @apiGroup Manager
     * @apiParam {string} name 项目名称
     * @apiParam {string} prefix 项目前缀
     * @apiParam {String[]} versions 版本号
     * @apiParam {String[]} modules 模块格式：{  dir: String,name: String, }
     * @apiParam {String[]} languages 语言包{ fileName: String,  lang: String,  label: String,}
     * @apiParam {String[]} specials 特制版本号
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/project/update
     * @apiVersion 1.0.0
     */
    @Post("/update")
    @Power(ROLE_TYPE.ADMIN)
    @Logger(LOGGER_OPERATE.UPDATE_PROJECT, {T: `将项目名修改为 ：<%= name %>`})
    public async update(@Req() req: Request, @Res() res: Response) {
        const pid = req.body.pid;
        const project = await Project.findOne({pid});
        ok(project, '项目不存在');
        ['name', 'prefix', 'port', 'versions', 'modules', 'languages', 'specials'].forEach(field => {
            if (req.body.hasOwnProperty(field)) {
                project[field] = req.body[field];
            }
        });
        const result = await project.save();
        return res.json(new BaseResponse<IProjectDocument>(result));
    }

    /**
     * @api {post} /api/manager/project/delete 项目删除
     * @apiDescription 项目模块
     * @apiName delete 项目删除
     * @apiGroup Manager
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/project/delete
     * @apiVersion 1.0.0
     */

    @Post("/delete")
    @Power(ROLE_TYPE.ADMIN)
    @Logger(LOGGER_OPERATE.DELETE_PROJECT, {T: `将项目删除`})
    public async delete(@Req() req: Request, @Res() res: Response) {
        const pid = req.body.pid;
        const project = await Project.findOne({pid});
        ok(project, '项目不存在');
        if (req.session.user.role !== ROLE_TYPE.ROOT.value) equal(project.username, req.session.user.username, '非创建者无法删除');
        const result = await Project.deleteOne({pid});
        return res.json(new BaseResponse(result));
    }

    /**
     * @api {post} /api/manager/project/progress 项目进度
     * @apiDescription 项目模块
     * @apiName progress 项目进度
     * @apiGroup Manager
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/project/progress
     * @apiVersion 1.0.0
     */
    @Post("/progress")
    @Power(ROLE_TYPE.VISITOR)
    public async progress(@Req() req: Request, @Res() res: Response) {
        const pid = req.body.pid;
        const [project, dbI18ns] = await Promise.all([Project.findByPid(pid), I18n.findByPid(pid)]);
        ok(project, '项目不存在');
        let _count = 0;
        const {languages} = project;
        dbI18ns.forEach(i18n => {
            languages.forEach(({lang}) => {
                if (i18n.values[lang]) _count++;
            });
        });
        const result = _count / (languages.length * dbI18ns.length) * 100;
        return res.json(new BaseResponse<number>(result));
    }

    /**
     * @api {post} /api/manager/project/survey 首页概况
     * @apiDescription 项目模块
     * @apiName survey 项目概况
     * @apiGroup Manager
     * @apiParam {string} pid PID
     * @apiSuccess {json} result translate_finish/translate_total：翻译完成单位 ;
     * languages:支持语言 ，key_total/key_finish：key翻译完成单位；
     * progress：翻译进度 ；
     * modules：模块数量 ；
     * specials：特制资源 ；
     * project：项目相关
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : [{ translate_finish:1, translate_total:1,languages:1, key_total:1,key_finish:1, progress:1,project：{}}],
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/project/survey
     * @apiVersion 1.0.0
     */
    @Post("/survey")
    @Power(ROLE_TYPE.VISITOR)
    public async survey(@Req() req: Request, @Res() res: Response) {
        const {pid} = req.body;
        const [project, dbI18ns] = await Promise.all([Project.findByPid(pid), I18n.findByPid(pid)]);
        ok(project, '项目不存在');

        let _count = 0;
        let _countKey = 0;
        const {languages, specials, modules} = project;
        dbI18ns.forEach(i18n => {
            let finished = true;
            languages.forEach(item => {
                if (i18n.values[item.lang]) {
                    _count++;
                } else {
                    finished = false;
                }
            });
            if (finished) _countKey++;
        });
        const result = <IProjectSurveyResult>{
            translate_finish: _count,
            translate_total: dbI18ns.length,
            languages: languages.length,
            specials: specials.length,
            modules: modules.length,
            key_total: dbI18ns.length,
            key_finish: _countKey,
            progress: _count / (languages.length * dbI18ns.length) * 100,
            project
        };
        return res.json(new BaseResponse<IProjectSurveyResult>(result));
    }
}
