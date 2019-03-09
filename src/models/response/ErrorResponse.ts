import BaseResponse from "./BaseResponse";

export default class ErrorResponse extends BaseResponse<string> {
    public code: number = -1;

    constructor(msg = '操作失败', data?) {
        super(data, msg);
    }
}