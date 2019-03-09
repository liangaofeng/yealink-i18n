import IRequest from "./IRequest";

export default interface IListRequest extends IRequest {
    key: string,
    skip: number,
    limit: number,
    desc: string,
    order: string;
}
