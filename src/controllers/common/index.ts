import {Request, Response} from "express";
import {exec} from "child_process";
import {ok} from "assert";
import {Controller, Res, Post, Get, Req} from "routing-controllers";
import {Logger, Power} from "../../middlewares";
import {LOGGER_OPERATE, ROLE_TYPE} from "../../types";
import Utils from "../../utils";
import Project from "../../repository/entity/Project";
import {BaseResponse} from "../../models";

@Controller("/common")
export class CommonController {
    /**
     * @api {post} /api/common/sync 预览环境同步更新国际化文件
     * @apiDescription 公用模块
     * @apiName common/sync 同步更新
     * @apiGroup Common
     * @apiParam {string} pid PID
     * @apiSuccess {json} result
     * @apiSuccessExample {json} Success-Response:
     *  {
     *      "code" : "0",
     *      "data" : {},
     *      "msg":""
     *  }
     * @apiSampleRequest /api/manager/common/sync
     * @apiVersion 1.0.0
     */
    @Get("/sync")
    @Post("/sync")
    @Power(ROLE_TYPE.DEVELOPER)
    @Logger(LOGGER_OPERATE.INIT_FRONT_PROJECT, {T: `同步预览环境`})
    public async sync(@Req() req: Request, @Res() res: Response) {
        const {pid} = req.body;
        const project = await Project.findOne({pid});
        ok(project, '项目不存在');

        const _path = Utils.getProjectFolder(project.name, true);

        exec(`cd ${_path} && npm run i18n:get`, function (error, stdout, stderr) {
            if (error) {
                console.error(error);
                ok(!error, '更新失败，请手动执行');
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            req['setLogger'] && req['setLogger']({stdout, stderr});
            return res.json(new BaseResponse());
        });

    }
}
