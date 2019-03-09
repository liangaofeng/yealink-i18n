import IRequest from "./interface/IRequest";

/**
 * 基础请求类
 */
export default class BaseRequest implements IRequest {
    source: string;
    password: string;
    username: string = 'DS';

    constructor(c:any){
        Object.keys(c).forEach(k => {
            if (c[k] !== null && c[k] !== undefined) {
                this[k] = c[k];
            }
        });
    }

    public static create<T>(c: new () => T): T {
        if (c) {
            Object.keys(c).forEach(k => {
                if (c[k] !== null && c[k] !== undefined) {
                    this[k] = c[k];
                }
            });
        }
        return new c();
    }
}