import {ExpressErrorMiddlewareInterface, Middleware} from "routing-controllers";

import {ErrorResponse} from "../models";

/**
 * 全局错误拦截
 */
@Middleware({type: "after"})
export class AllErrorsHandler implements ExpressErrorMiddlewareInterface {
    error(error: any, request: any, response: any): void {
        const reason = error.message || error.toString();
        console.error('出错啦');
        console.error(request.url, error, reason);
        if (error.status === 500) {
            response.status(500);
            return response.render("error", '内部错误');
        } else {
            return response.json(new ErrorResponse(reason));
        }
    }
}

