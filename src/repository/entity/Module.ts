import * as mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
    mid: {type: mongoose.Schema.Types.ObjectId, index: true, unique: true},
    pid: String,
    name: String,
    label: String,
    path: String,
    route: String,
    module: String,
    modulePath: String,
    file: String
}, {timestamps: true});

export interface IModuleDocument extends mongoose.Document {
    mid: mongoose.Schema.Types.ObjectId,
    pid: string,
    name: string,
    label: string,
    path: string,
    route: string,
    module: string,
    modulePath: string,
    file: string
}

export interface IModuleModel extends mongoose.Model<IModuleDocument> {

}


class ModuleClass extends mongoose.Model {


}

ModuleSchema.loadClass(ModuleClass);

const saveHandler = function (next) {
    if (!this.uid) this.uid = new mongoose.Types.ObjectId;
    next();
};

ModuleSchema.pre('save', saveHandler);


const Module = mongoose.model<IModuleDocument, IModuleModel>('Module', ModuleSchema);

export default Module;
