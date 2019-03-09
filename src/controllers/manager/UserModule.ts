import {Response, Request} from "express";
import {ok} from "assert";
import {Controller, Res, Get, Req, Post} from "routing-controllers";

import User, {IUserDocument} from "../../repository/entity/User";

import {Logger, Power} from '../../middlewares/';

import {BaseResponse, ListRequest, ListResponse} from '../../models';
import {LOGGER_OPERATE, ROLE_TYPE} from "../../types";


@Controller("/manager")
export class UserModuleController {
    /**
     * @api {post} /api/manager/login 用户登录
     * @apiDescription 用户模块
     * @apiName login 登录
     * @apiGroup Manager
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
     * @apiSampleRequest /api/manager/login
     * @apiVersion 1.0.0
     */
    @Post("/login")
    @Logger(LOGGER_OPERATE.LOGIN)
    public async login(@Req() req: Request, @Res() res: Response) {
        const {username, password} = req.body;
        let user = await User.login(username, password);
        ok(user, '用户名或密码错误');
        req.session.user = user;
        return res.json(new BaseResponse<IUserDocument>(user));
    }

    @Post("/exit")
    @Logger(LOGGER_OPERATE.LOGOUT)
    public async exit(@Req() req: Request, @Res() res: Response) {
        req.session.user = null;
        req.session.destroy(null);
        return res.json(new BaseResponse());
    }

    @Get("/user/info")
    @Post("/user/info")
    @Power(ROLE_TYPE.VISITOR)
    public async info(@Req() req: Request, @Res() res: Response) {
        let user = await User.findOne({username: req.session.user.username}).select('username name role');
        ok(user, '用户不存在');
        return res.json(new BaseResponse<IUserDocument>(user));
    }

    @Post("/user/list")
    @Power(ROLE_TYPE.VISITOR)
    public async list(@Req() req: Request, @Res() res: Response) {
        const result = await User.list(new ListRequest(req.body));
        return res.json(new ListResponse(result));
    }

    @Post("/user/create")
    @Power(ROLE_TYPE.ROOT)
    @Logger(LOGGER_OPERATE.ADD_USER, {T: `创建新用户 ：<%= username %> （<%= name %>）`})
    public async create(@Req() req: Request, @Res() res: Response) {
        const {username, password, name} = req.body;

        ok(username, '用户名不能为空');
        ok(password, '密码不能为空');
        ok(name, '姓名不能为空');
        ok(!await User.findOne({username}), '名称已存在');

        const user = new User(req.body);
        const result = await user.save();
        return res.json(new BaseResponse<IUserDocument>(result));
    }

    @Post("/user/update")
    @Power(ROLE_TYPE.ROOT)
    @Logger(LOGGER_OPERATE.UPDATE_USER, {T: `将用户名 <%= uid %> 修改为 ：<%= name %>`})
    public async update(@Req() req: Request, @Res() res: Response) {
        const {uid} = req.body;
        const user = await User.findOne({uid});

        ok(user, '用户不存在');

        ['name', 'password', 'role', 'projects'].forEach(field => {
            if (req.body[field]) {
                user[field] = req.body[field];
            }
        });

        const result = await user.save();
        return res.json(new BaseResponse<IUserDocument>(result));
    }

    @Post("/user/delete")
    @Power(ROLE_TYPE.ROOT)
    @Logger(LOGGER_OPERATE.DELETE_USER, {T: `将用户删除 <%= uid %>`})
    public async delete(@Req() req: Request, @Res() res: Response) {
        const uid = req.body.uid;
        const result = await User.deleteOne({uid});
        return res.json(new BaseResponse<IUserDocument>(result));
    }

    @Post("/user/password")
    @Power(ROLE_TYPE.ROOT)
    @Logger(LOGGER_OPERATE.UPDATE_USER_PASSWORD, {T: `用户修改密码`})
    public async password(@Req() req: Request, @Res() res: Response) {
        const {newPassword, oldPassword} = req.body;
        ok(newPassword.trim(), '密码不能为空');
        let user = await User.findOne({username: req.session.user.username, password: oldPassword});
        ok(user, '旧密码输入错误');
        user.password = newPassword;
        const result = await user.save();
        return res.json(new BaseResponse<IUserDocument>(result));
    }
}
