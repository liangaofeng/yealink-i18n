import BaseRequest from "./BaseRequest";

class ListRequest extends BaseRequest {
    private _skip: number;
    private _limit: number;
    private _desc: string;

    get skip(): number {
        return Number(this._skip) || 0;
    }

    set skip(value: number) {
        this._skip = value;
    }

    get limit(): number {
        return this._limit && Number(this._limit) || 20;
    }

    set limit(value: number) {
        this._limit = value;
    }

    get desc(): string {
        return this._desc || 'desc';
    }

    set desc(value: string) {
        this._desc = value;
    }

    order: string;
    key: string;
}

export default ListRequest;