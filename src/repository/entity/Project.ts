import * as mongoose from 'mongoose';

import * as Models from '../../models';
import Config from '../../config';

export interface IProjectModule {
    dir: string,
    name: string,
}

export interface IProjectLanguage {
    fileName: string,
    lang: string,
    label: string,
    value: string,
    display: boolean,
    default: boolean,
}

export interface IProjectSpecial {
    label: string,
    value: string,
}

const ProjectSchema = new mongoose.Schema({
    pid: {type: mongoose.Schema.Types.ObjectId, index: true, unique: true},
    username: String,
    name: {
        type: String,
        required: [true, '名称不能为空']
    },
    prefix: String,
    port: Number,
    versions: Array,
    modules: [{
        dir: String,
        name: String,
    }],
    languages: [{
        fileName: String,
        lang: String,
        label: String,
        value: String,
        display: {type: Boolean, default: true},
        default: {type: Boolean, default: false},
    }],
    specials: [{
        label: String,
        value: String,
    }]
}, {timestamps: true});


export interface IProjectDocument extends mongoose.Document {
    pid: mongoose.Schema.Types.ObjectId,
    username: string,
    name: string,
    prefix: string,
    port: number,
    versions: string[],
    modules: IProjectModule[],
    languages: IProjectLanguage[],
    specials: IProjectSpecial[]
}

export interface IProjectModel extends mongoose.Model<IProjectDocument> {
    findByName(name: string): Promise<IProjectDocument>;

    findByPid(pid: string): Promise<IProjectDocument>;

    list(params: Models.ListRequest): Promise<Models.IListResponse>;
}


class ProjectClass extends mongoose.Model {

    public static async findByName(name): Promise<IProjectDocument> {
        return this.findOne({name});
    }

    public static async findByPid(pid): Promise<IProjectDocument> {
        return this.findOne({pid});
    }

    public static async list(params: Models.ListRequest = <Models.ListRequest>{}): Promise<Models.IListResponse> {
        const {skip, limit, key, desc, order} = params;

        const conditions = {};
        if (key) {
            const reg = {'$regex': key, $options: '$i'};
            conditions['$or'] = [
                {'name': reg}
            ];
        }
        const sort = {[order || 'createdAt']: desc === 'asc' ? 1 : -1};

        const query = this.find(conditions);

        const list = await query.sort(sort).skip(skip).limit(limit < 1 ? 1000 : limit);
        const total = await this.countDocuments(conditions);

        return <Models.IListResponse>{list, total};
    }
}

ProjectSchema.loadClass(ProjectClass);

const saveHandler = function (next) {
    if (!this.pid) this.pid = new mongoose.Types.ObjectId;
    if (!Number.isNaN(this.port)) this.port = 7000 + Math.ceil(Math.random() * 1000);
    if (!this.prefix) this.prefix = '@i18n';
    if (!Array.isArray(this.languages) || !this.languages.length) {
        this.languages = Config.languages.filter(x => x.default === true);
    }
    this.languages.forEach(language => {
        if (!language.value) language.value = language.lang;
        if (!language.fileName) language.fileName = language.lang + '.js';
    });
    next();
};

ProjectSchema.pre('save', saveHandler);

const Project = mongoose.model<IProjectDocument, IProjectModel>('Project', ProjectSchema);

export default Project;