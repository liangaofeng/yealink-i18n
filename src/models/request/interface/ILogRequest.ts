import IListRequest from "./IListRequest";

export default interface ILogRequest extends IListRequest {
    operate: string,
    pid: string,
}
