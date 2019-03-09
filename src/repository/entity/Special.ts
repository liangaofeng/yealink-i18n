import * as mongoose from 'mongoose';
import * as Models from "../../models";
import {IValue} from "./I18n";


const SpecialSchema = new mongoose.Schema({
    pid: {
        type: String,
        required: true
    },
    special: {
        type: String,
        required: true
    },
    key: {
        type: String,
        required: true,
        message: 'Key不能为空'
    },
    values: {type: mongoose.Schema.Types.Mixed, default: {}}
}, {timestamps: true});

export interface ISpecialDocument extends mongoose.Document {
    pid: string,
    special: string,
    key: string,
    values: IValue
}

export interface ISpecialModel extends mongoose.Model<ISpecialDocument> {

    list(params: Models.ListSpecialRequest): Promise<Models.IListResponse>;

    findByPid(pid: string): Promise<ISpecialDocument[]>;

    findByKey(key: string): Promise<ISpecialDocument>;

    updateValueMany(key: string): Promise<void>;
}


class SpecialClass extends mongoose.Model {

    public static async findByPid(pid: string): Promise<ISpecialDocument[]> {
        return this.find({pid});
    }

    public static async findByKey(key: string): Promise<ISpecialDocument> {
        return this.findOne({key});
    }

    public static async list(params: Models.ListSpecialRequest = <Models.ListSpecialRequest>{}): Promise<Models.IListResponse> {
        const {skip, limit, key, desc, order, special} = params;
        const conditions = {special};
        if (key) {
            const reg = {'$regex': key};
            conditions['$or'] = [
                {'key': reg},
                {'values.zh': reg}
            ];
        }
        const sort = {[order || 'updatedAt']: desc === 'asc' ? 1 : -1};

        const list = await this.find(conditions).sort(sort).skip(skip).limit(limit);
        const total = await this.countDocuments(conditions);
        return <Models.IListResponse>{list, total};
    }

    public static updateValueMany(arr, languages): Promise<void> {
        return new Promise(resolve => {
            if (!arr.length) {
                return resolve();
            }
            arr.forEach((row, index) => {
                const values = {};
                languages.forEach(({lang}) => {
                    values[lang] = row[lang];
                });
                this.findByIdAndUpdate(row._id, {
                    values
                }, function (err) {
                    if (err) console.error(err);
                    if (index === arr.length - 1) {
                        resolve();
                    }
                });
            })
        });
    }

}

SpecialSchema.loadClass(SpecialClass);

const Special = mongoose.model<ISpecialDocument, ISpecialModel>('Special', SpecialSchema);

export default Special;
