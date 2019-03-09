import * as mongoose from 'mongoose';
import ROLE_TYPE from '../../types/ROLE_TYPE';
import Ldap from '../../utils/Ldap';
import Config from '../../config';

import * as Models from '../../models';

mongoose.set('useFindAndModify', false);

const UserSchema = new mongoose.Schema({
    uid: {type: mongoose.Schema.Types.ObjectId, index: true, unique: true},
    name: {
        type: String,
        required: [true, '名称不能为空'],
        default: '管理员'
    },
    username: {
        type: String,
        required: [true, '账号不能为空']
    },
    password: {
        type: String,
        required: [true, '密码不能为空']
    },
    role: {
        type: Number,
        default: ROLE_TYPE.VISITOR.value
    },
    projects: {
        type: Array,
        default: []
    },
    status: {
        type: Number,
        default: 0
    }
}, {timestamps: true});

export interface IUserDocument extends mongoose.Document {
    uid: mongoose.Schema.Types.ObjectId,
    name: string,
    username: string,
    password: string,
    role: number,
    projects: string[],
    status: number
}

export interface IUserModel extends mongoose.Model<IUserDocument> {
    login(username: string, password: string): Promise<IUserDocument>;

    list(params: Models.ListRequest): Promise<Models.IListResponse>;
}


class UserClass extends mongoose.Model {

    public static async login(username, password): Promise<IUserDocument> {
        return new Promise(async resolve => {
            let user = await User.findOne({username, password}).select('username name role');
            if (!user && Config.ldap.enable) {
                const role = ROLE_TYPE.VISITOR.value;
                const ldap = new Ldap().client();
                const ldapUser = await ldap.bind({username, password});
                if (!ldapUser) return resolve(null);
                const oldUser = await User.findOne({username});
                if (oldUser) {
                    oldUser.password = password;
                } else {
                    user = new User({username, password, name: ldapUser.name, role});
                }
                await user.save();
            }
            resolve(user);
        });
    }

    public static async list(params: Models.ListRequest = <Models.ListRequest>{}): Promise<Models.IListResponse> {
        const {skip, limit, key, desc, order} = params;

        const conditions = {"role": {$gte: ROLE_TYPE.VISITOR.value, $lt: ROLE_TYPE.ROOT.value}};
        if (key) {
            const reg = {'$regex': key, $options: '$i'};
            conditions['$or'] = [
                {'username': reg},
                {'name': reg}
            ];
        }
        const sort = {[order || 'createdAt']: desc === 'asc' ? 1 : -1};

        const query = this.find(conditions);

        const list = await query.sort(sort).skip(skip).limit(limit).select('name username role projects status createdAt updatedAt uid');
        const total = await this.countDocuments(conditions);

        return <Models.IListResponse>{list, total};
    }
}

UserSchema.loadClass(UserClass);

const saveHandler = function (next) {
    if (!this.uid) this.uid = new mongoose.Types.ObjectId;
    next();
};

UserSchema.pre('save', saveHandler);

const User = mongoose.model<IUserDocument, IUserModel>('User', UserSchema);

export default User;