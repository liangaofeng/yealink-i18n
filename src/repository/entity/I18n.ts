import * as mongoose from 'mongoose';

import Config from '../../config';
import * as Models from "../../models";
import {IProjectLanguage} from "./Project";
import ListPidRequest from "../../models/request/ListPidRequest";

const I18nSchema = new mongoose.Schema({
    pid: {
        type: String,
        required: true
    },
    mid: String,
    module: String,
    key: {
        type: String,
        required: true,
        message: 'Key不能为空'
    },
    values: {type: mongoose.Schema.Types.Mixed, default: {}}
}, {timestamps: true});

export interface IValue {
    [propName: string]: string;
}

export interface II18nSync {
    _id: string,
    pid: string,
    lang: string
}

export interface II18nMerge {
    pid: string,
    languages: string[]
}

export interface II18nDocument extends mongoose.Document {
    pid: string,
    mid: string,
    module: string,
    key: string,
    values: IValue
}

interface II18nModel extends mongoose.Model<II18nDocument> {
    findByName(name: string): Promise<II18nDocument>;

    findByPid(pid: string): Promise<II18nDocument[]>;

    findByKey(key: string): Promise<II18nDocument>;

    updateValueMany(key: string[],languages: IProjectLanguage[]): Promise<void>;

    updateModuleMany(params:any): Promise<void>;

    merge(params:II18nMerge): Promise<II18nDocument[]>;

    sync(params: II18nSync): Promise<II18nDocument[]>;

    list(params: ListPidRequest): Promise<Models.IListResponse>;
}


class I18nClass extends mongoose.Model {

    public static async list(params: ListPidRequest): Promise<Models.IListResponse> {
        const {skip, limit, key, desc, order, pid} = params;
        const conditions = {pid};
        if (key) {
            const reg = {'$regex': key}; //, $options: '$i'
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

    public static async findByPid(pid: string): Promise<II18nDocument[]> {
        return this.find({pid});
    }

    public static async findByKey(key: string): Promise<II18nDocument> {
        return this.findOne({key});
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
                this.updateOne({_id: row._id}, {values}, function (err) {
                    if (err) console.error(err);
                    if (index === arr.length - 1) {
                        resolve();
                    }
                });
            })
        });
    }

    public static updateModuleMany(arr:any): Promise<void> {
        return new Promise(resolve => {
            if (!arr.length) {
                return resolve();
            }
            arr.forEach((row, index) => {
                this.updateOne({_id: row._id}, {
                    module: row.module
                }, function (err) {
                    if (err) console.error(err);
                    if (index === arr.length - 1) {
                        resolve();
                    }
                });
            })
        });
    }

    /***
     * 数据量大情况下合并
     */
    public static merge(params:II18nMerge): Promise<II18nDocument[]> {
        const {pid, languages} = params;
        return new Promise(async resolve => {
            const zh = Config.defaultChineseLang;
            const dbI18ns = await this.find({pid});
            const languagesLen = languages.length;
            let dbI18nMapFullZh = {};// zh:item
            let list = [];
            dbI18ns.forEach(x => {
                x._count = 0;
                let _full = true;
                for (let i = 0; i < languagesLen; i++) {
                    if (!x.values[languages[i]]) {
                        _full = false;
                    } else {
                        x._count++;
                    }
                }
                if (_full) {
                    dbI18nMapFullZh[x.values[zh]] = x;
                } else {
                    list.push(x);
                }
            });

            // list = list.filter(x => dbI18nMapFullZh[x.values[zh]]);
            const listLen = list.length;

            if (!list.length || !Object.keys(dbI18nMapFullZh).length) {
                return resolve();
            }

            const date = new Date();
            const seconds = date.getSeconds();

            const mergeList = [];

            list.forEach((row, index) => {
                const {values} = row;
                const zhValue = dbI18nMapFullZh[values[zh]];
                if (zhValue) {
                    mergeList.push(row);
                    languages.forEach(lang => {
                        if (!values[lang]) values[lang] = zhValue.values[lang];
                    });
                }
                this.updateOne({_id: row._id}, zhValue ? {values} : {updatedAt: date.setSeconds(seconds + row._count)}, function (err) {
                    if (err) console.error(err);
                    if (index === listLen - 1) {
                        resolve(mergeList);
                    }
                });
            })
        });

    }


    public static sync(params: II18nSync): Promise<II18nDocument[]> {
        const {_id, pid, lang} = params;
        return new Promise(async resolve => {
            const zh = Config.defaultChineseLang;
            let i18n = await this.findOne({_id, pid});
            if (!i18n.values[lang] || zh === lang) {
                return resolve();
            }
            let list = await this.find({
                pid,
                [`values.${Config.defaultChineseLang}`]: i18n.values[zh]
            });
            console.log(list);
            list = list.filter(x => !x.values[lang]);

            if (!list.length) {
                return resolve();
            }
            list.forEach((row, index) => {
                this.updateOne({_id: row._id}, {[`values.${lang}`]: i18n.values[lang]}, function (err) {
                    if (err) console.error(err);
                    if (index === list.length - 1) {
                        resolve(list);
                    }
                });
            })
        });
    }


}

I18nSchema.loadClass(I18nClass);

const I18n = mongoose.model<II18nDocument, II18nModel>('I18n', I18nSchema);

export default I18n;