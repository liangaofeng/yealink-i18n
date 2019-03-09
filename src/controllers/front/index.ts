import {Request, Response} from "express";
import *  as fs from "fs";
import *  as AdmZip from "adm-zip";
import *  as multiparty from "multiparty";
import {exec} from "child_process";
import {ok} from "assert";
import {Controller, Res, Post, Req} from "routing-controllers";
import {Logger, Power} from "../../middlewares";
import {LOGGER_OPERATE, ROLE_TYPE} from "../../types";
import Utils from "../../utils";
import DateTime from "../../utils/DateTime";
import {Project, I18n, Module} from "../../repository";
import {BaseResponse} from "../../models";
import FrontGetResult from "../../models/result/FrontGetResult";
import {IModuleDocument} from "../../repository/entity/Module";


@Controller("/front")
export class FrontController {
    /**
     * @api {post} /api/front/init 初始化项目
     * @apiDescription  初始化项目
     * @apiName front/init 初始化项目
     * @apiGroup Front
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : {
     *          "username" : "username",
     *          "role" : "role",
     *          "name" : "name"
     *      },
     *      "msg":""
     *  }
     * @apiSampleRequest /api/front/init
     * @apiVersion 1.0.0
     */
    @Post("/init")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.INIT_FRONT_PROJECT, {T: `初始化项目`})
    public async init(@Req() req: Request, @Res() res: Response) {
        const {pid} = req.body;
        const project = await Project.findOne(pid.length === 24 ? {pid} : {'name': pid});
        ok(project, '项目不存在');
        return res.json(new BaseResponse(project['toObject']()));
    }

    /**
     * @api {post} /api/front/get 国际化获取
     * @apiDescription  获取国际化
     * @apiName front/get 获取国际化
     * @apiGroup Front
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : {},
     *      "msg":""
     *  }
     * @apiSampleRequest /api/front/get
     * @apiVersion 1.0.0
     */
    @Post("/get")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.INIT_FRONT_PROJECT, {T: `获取项目I18n`})
    public async get(@Req() req: Request, @Res() res: Response) {
        let {pid} = req.body;

        const project = await Project.findOne({pid});
        ok(project, '项目不存在');

        const dbI18ns = await I18n.find({pid});

        let data: FrontGetResult[] = [];
        project.languages.forEach(language => {
            let fgm = new FrontGetResult(language, dbI18ns);
            data.push(fgm);
        });
        return res.json(new BaseResponse(data));
    }

    /**
     * @api {post} /api/front/module 国际化模块获取
     * @apiDescription  获取国际化模块
     * @apiName front/module 获取国际化模块
     * @apiGroup Front
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : {},
     *      "msg":""
     *  }
     * @apiSampleRequest /api/front/module
     * @apiVersion 1.0.0
     */
    @Post("/module")
    @Power(ROLE_TYPE.DEVELOPER)
    public async module(@Req() req: Request, @Res() res: Response) {
        let {pid} = req.body;

        const project = await Project.findOne({pid});
        ok(project, '项目不存在');

        const data = (await Module.find({pid})) || [];
        return res.json(new BaseResponse<IModuleDocument[]>(data));
    }

    /**
     * @api {post} /api/front/upload 国际化上传
     * @apiDescription  上传国际化
     * @apiName /front/upload 上传国际化
     * @apiGroup Front
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : {},
     *      "msg":""
     *  }
     * @apiSampleRequest /api/front/upload
     * @apiVersion 1.0.0
     */
    @Post("/upload")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.UPDATE_I18N)
    public async upload(@Req() req: Request, @Res() res: Response) {

        let {pid, chList = []} = req.body;
        const project = await Project.findOne({pid});
        ok(project, '项目不存在');
        const dbI18ns = await I18n.find({pid});
        const dbI18nMap = Utils.createMap(dbI18ns, 'key');

        const newKeys = [];
        const updateKeys = [];
        const {languages} = project;

        chList.forEach(({key, title, module}) => {
            if (dbI18nMap.hasOwnProperty(key)) {
                const oldDbI18n = dbI18nMap[key];
                if (oldDbI18n['_id']) {//数据库里面的数据，非现在导入的
                    if (oldDbI18n.module !== module) {
                        updateKeys.push({_id: oldDbI18n._id, module});
                    }
                }
            } else {
                const newItem: any = {key: key, module, values: {}, pid, _count: 0};
                languages.forEach(({lang}) => {
                    newItem.values[lang] = lang === 'zh' ? title : '';
                });
                newKeys.push(newItem);
                dbI18nMap[newItem.key] = newItem;
            }
        });

        //日志处理
        req['setLogger'] && req['setLogger']({
            newI18n: newKeys,
            updateI18n: updateKeys
        });

        Promise.all([I18n.insertMany(newKeys), I18n.updateModuleMany(updateKeys)]).then(() => {
            return res.json(new BaseResponse({
                newKeys: newKeys.length,
                updateKeys: updateKeys.length
            }));
        });
    }

    /**
     * @api {post} /api/front/publish 国际化发布
     * @apiDescription  发布国际化
     * @apiName front/publish 发布国际化
     * @apiGroup Front
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : {},
     *      "msg":""
     *  }
     * @apiSampleRequest /api/front/publish
     * @apiVersion 1.0.0
     */
    @Post("/publish")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.INIT_FRONT_PROJECT, {T: `发布项目`})
    public async publish(@Req() req: Request, @Res() res: Response) {
        let {pid} = req.body;
        if (!pid) pid = req.query.pid;
        const project = await Project.findOne({pid});
        ok(project, '项目不存在');

        const form = new multiparty.Form();

        const projectPath = Utils.getProjectFolder(project.name, true);

        form.uploadDir = `${projectPath}.zip/`;

        Utils.mkDir(form.uploadDir);

        form.maxFilesSize = 20 * 1024 * 1024;
        //form.maxFields = 1000;  设置所以文件的大小总和
        form.parse(req, function (err, _fields, {file: [file]}) {
            if (err) throw err;
            //重命名文件名
            const rename = form.uploadDir + DateTime.uuid() + `.zip`;
            fs.rename(file.path, rename, (err) => {
                if (err) throw err;
                const zip = new AdmZip(rename);
                zip.extractAllTo(projectPath, true);

                exec(`cd ${projectPath} && npm install`, function (error, stdout, stderr) {

                    if (error) {
                        throw 'npm 安装依赖失败，请手动执行';
                    }

                    const result = `http://${Utils.getIp()}:${project.port}`;

                    //自动启动
                    // child_process.exec(`cd ${projectPath} && npm run start`, function (err) {
                    //     if (err) return false;
                    // });
                    req['setLogger'] && req['setLogger']({stdout, stderr});

                    return res.json(new BaseResponse<string>(result));
                });
            });
        });
    }
}
