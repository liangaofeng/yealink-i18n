import {Request, Response} from "express";
import {ok} from "assert";
import {Controller, Res, Post, Req} from "routing-controllers";

import {Logger, Power} from "../../middlewares";
import {LOGGER_OPERATE, ROLE_TYPE} from "../../types";
import {Project, I18n, User} from "../../repository";
import {BaseResponse} from "../../models";

@Controller("/preview")
export class PreviewController {

    /**
     * @api {post} /api/preview/login 预览用户登录
     * @apiDescription 预览环境
     * @apiName preview/login 登录
     * @apiGroup Preview
     * @apiParam {string} username 用户名
     * @apiParam {string} password 密码
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
     * @apiSampleRequest /api/preview/login
     * @apiVersion 1.0.0
     */
    @Post("/login")
    @Power(ROLE_TYPE.VISITOR)
    @Logger(LOGGER_OPERATE.LOGIN, {T: `用户：<%= username %> 登录系统`})
    public async login(@Req() req: Request, @Res() res: Response) {
        const {username, password} = req.body;
        const user = await User.findOne({username, password}).select('username name role');
        ok(user, '用户名或密码错误');
        req.session.user = user;
        return res.json(new BaseResponse(user));
    }

    /**
     * @api {post} /api/preview/project/list 预览项目列表
     * @apiDescription 预览环境
     * @apiName preview/project/list 项目列表
     * @apiParam {string} username 用户名
     * @apiParam {string} password 密码
     * @apiGroup Preview
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
     * @apiSampleRequest /api/preview/project/list
     * @apiVersion 1.0.0
     */
    @Post("/project/list")
    @Power(ROLE_TYPE.DEVELOPER)
    public async projects(@Req() req: Request, @Res() res: Response) {
        const {username, password} = req.body;
        const user = await User.findOne({username, password}).select('projects');
        const result = await Project.find({pid: {$in: (user.projects || [])}});
        return res.json(new BaseResponse(result));
    }

    /**
     * @api {post} /api/preview/project/get  预览项目详情
     * @apiDescription 预览环境
     * @apiName preview/project/get 项目详情
     * @apiParam {string} username 用户名
     * @apiParam {string} password 密码
     * @apiGroup Preview
     * @apiParam {string} pid PID
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
     * @apiSampleRequest /api/preview/project/get
     * @apiVersion 1.0.0
     */
    @Post("/project/get")
    @Power(ROLE_TYPE.DEVELOPER)
    public async project(@Req() req: Request, @Res() res: Response) {
        const {pid} = req.body;
        const result = await Project.findOne({pid});
        return res.json(new BaseResponse(result));
    }

    /**
     * @api {post} /api/preview/search 预览查找国际化信息
     * @apiDescription 预览环境
     * @apiName preview/search 查找国际化信息
     * @apiGroup Preview
     * @apiParam {string} pid PID
     * @apiParam {string} username 用户名
     * @apiParam {string} password 密码
     * @apiParam {string} key 搜索关键字
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : {},
     *      "msg":""
     *  }
     * @apiSampleRequest /api/preview/search
     * @apiVersion 1.0.0
     */
    @Post("/search")
    @Power(ROLE_TYPE.DEVELOPER)
    public async search(@Req() req: Request, @Res() res: Response) {
        const {pid, key} = req.body;
        const result = await I18n.findOne({pid, key});
        return res.json(new BaseResponse(result));
    }

    /**
     * @api {post} /api/preview/update 预览更新国际化值
     * @apiDescription 预览环境
     * @apiName preview/update 更新国际化值
     * @apiGroup Preview
     * @apiParam {string} pid PID
     * @apiParam {string} value 更新的值
     * @apiParam {string} _id 国际化_id
     * @apiParam {string} lang 语言
     * @apiParam {string} username 用户名
     * @apiParam {string} password 密码
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : {},
     *      "msg":""
     *  }
     * @apiSampleRequest /api/preview/update
     * @apiVersion 1.0.0
     */
    @Post("/update")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.UPDATE_I18N, {T: `将国际化 ：<%= oldValue %> （key:<%= key %>） 修改为 ：<%= newValue %> , 语言：<%= lang %>  `})
    public async update(@Req() req: Request, @Res() res: Response) {
        const {username, password, pid, lang, value, _id} = req.body;
        ok(lang && value, 'value|lang 参数不能为空');
        const user = await User.findOne({username, password}).select('projects');
        if (!user.projects.includes(pid)) {
            ok(user, '账号不属于该项目,无权操作');
        }
        const i18n = await I18n.findOne({_id});
        ok(i18n, 'KEY不存在');
        i18n.values[lang] = value;
        i18n.markModified(`values.${lang}`);
        const result = await i18n.save();

        req['setLogger'] && req['setLogger']({
            oldValue: i18n.values[lang] || '',
            newValue: value,
            lang,
            key: i18n.key
        });

        return res.json(new BaseResponse(result));
    }

}

