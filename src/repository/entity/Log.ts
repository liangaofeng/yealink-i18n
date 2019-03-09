import * as mongoose from 'mongoose';
import LOGGER_OPERATE from '../../types/LOGGER_OPERATE';
import * as Models from "../../models";


const LogSchema = new mongoose.Schema({
    username: String,
    ip: String,
    operate: {
        type: String,
        default: LOGGER_OPERATE.PUBLIC
    },
    detail: {type: mongoose.Schema.Types.Mixed, default: ''},
    reason: String,
    pid: String,
    result: {
        type: String,
        default: 'SUCCESS'
    },
    level: {
        type: Number,
        default: 0
    },
    source: {
        type: String,
        default: '后台管理'
    }
}, {timestamps: true});

export interface ILogDocument extends mongoose.Document {
    username: string,
    ip: string,
    operate: string,
    detail: mongoose.Schema.Types.Mixed,
    reason: string,
    pid: string,
    result: string,
    level: number,
    source: string
}

export interface ILogModel extends mongoose.Model<ILogDocument> {
    list(params:Models.ListLogRequest): Promise<Models.IListResponse>;
}


class LogClass extends mongoose.Model {

    public static async list(params: Models.ListLogRequest = <Models.ListLogRequest>{}): Promise<Models.IListResponse> {
        const {skip, limit, key, desc, order, operate, pid} = params;

        const conditions = {};

        if(operate) Object.assign(conditions, {operate});
        if(pid) Object.assign(conditions, {pid});

        if (key) {
            const reg = {'$regex': key, $options: '$i'};
            conditions['$or'] = [
                {'username': reg},
                {'name': reg}
            ];
        }

        const sort = {[order || 'createdAt']: desc === 'asc' ? 1 : -1};

        const query = this.find(conditions);

        const list = await query.sort(sort).skip(skip).limit(limit).populate({
            path: 'project'
        });
        const total = await this.countDocuments(conditions);
        return <Models.IListResponse>{list, total};
    }
}

LogSchema.loadClass(LogClass);

const Log = mongoose.model<ILogDocument, ILogModel>('Log', LogSchema);

export default Log;
