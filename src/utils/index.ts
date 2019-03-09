import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

import Config from '../config/index';

/**
 * 工具类
 */
class Utils {
    /***
     * 获取缓存完整目录
     * @param dir 子目录
     * @param join 是否绝对路径
     */
    public static getCacheFolder(dir: string, join: boolean = false): string {
        const _path = `${Config.cacheFolder}/${dir}/`;
        Utils.mkDir(_path);
        return join ? path.join(process.cwd(), _path) : _path;
    }

    public static getProjectFolder(dir: string, join: boolean = false): string {
        const _path = `${Config.projectFolder}/${dir}/`;
        Utils.mkDir(_path);
        return join ? path.join(process.cwd(), _path) : _path;
    }

    public static mkDir(dir: string): boolean {
        const mkDirsSync = (dir: string) => {
            if (fs.existsSync(dir)) {
                return true;
            } else {
                if (mkDirsSync(path.dirname(dir))) {
                    fs.mkdirSync(dir);
                    return true;
                }
            }
        };
        if (fs.existsSync(dir)) {
            return true;
        } else {
            if (mkDirsSync(path.dirname(dir))) {
                fs.mkdirSync(dir);
                return true;
            }
        }
    }

    public static createJsFile(content: string, name: string = 'i18n-ext.js'): string {
        const savePath: string = Utils.getCacheFolder('export', true);
        Utils.mkDir(savePath);
        fs.writeFileSync(savePath + name, content);
        return name;
    }

    public static createMap(data: any, key: string) {
        let _map = {};
        data.forEach(x => {
            _map[x[key]] = x;
        });
        return _map;
    }

    public static setEmptyFields(o: any, ...fields: any[]): void {
        fields.forEach(field => {
            if (o[field] === null || o[field] === '') delete o[field];
        })
    }

    public static getIp(): string {
        const interfaces = os.networkInterfaces();
        for (let key in interfaces) {
            const network = interfaces[key];
            for (let i = 0; i < network.length; i++) {
                const alias = network[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }
        return 'localhost';
    }
}

export default Utils;