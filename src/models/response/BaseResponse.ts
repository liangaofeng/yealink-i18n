import IResponse from "./interface/IResponse";

export default class BaseResponse<T = null> implements IResponse {
    public code: number;
    public msg: string;
    public data: T;

    constructor(_data: T = <T>{}, _msg: string = '操作成功', _code: number = 0) {
        this.data = _data;
        this.code = _code;
        this.msg = _msg;
    }
}