import * as fs from 'fs';
import * as multiparty from 'multiparty';
import {WorkBook, readFile, utils, writeFile} from 'xlsx';

import DateTime from './DateTime';
import Utils from './index';

interface anyArray {
    [propName: string]: any[];
}

class Excel {

    public workbook: WorkBook;

    constructor() {

    }

    public init(wb: string) {
        if (!wb) throw '文件不存在';
        this.workbook = readFile(wb);
        return this;
    }

    public save(req):Promise<string> {
        return new Promise((resolve, reject) => {
            const form = new multiparty.Form();
            form.uploadDir = Utils.getCacheFolder('uploads', true);
            Utils.mkDir(form.uploadDir);

            form.maxFilesSize = 2 * 1024 * 1024;
            //form.maxFields = 1000;  设置所以文件的大小总和
            form.parse(req, function (err, _fields, fileList) {
                if (err) {
                    return reject(err);
                }
                if (!fileList || !Array.isArray(fileList.file) || !fileList.file.length) {
                    return reject(err);
                }
                const file = fileList.file[0];
                //重命名文件名
                const rename = form.uploadDir + DateTime.uuid() + `.xlsx`;
                fs.rename(file.path, rename, (err) => {
                    if (err) throw err;
                    resolve(rename);
                });
            });
        });
    }



    public toJson():anyArray {
        const result = {};
        const sheetNames: string[] = this.workbook.SheetNames;
        sheetNames.forEach((sheetName) => {
            const worksheet = this.workbook.Sheets[sheetName];
            result[sheetName] = utils.sheet_to_json(worksheet);
        });
        return result;
    }

    public toExcel(data, {name}) {

        let _data = {};
        let worksheet = {};

        data.forEach(item => {
            if (!_data[item.module]) _data[item.module] = [];
            _data[item.module].push({
                key: item.key,
                ...item.values
            });
        });

        const SheetNames = Object.keys(_data);
        SheetNames.forEach(SheetNames => {
            worksheet[SheetNames] = utils.json_to_sheet(_data[SheetNames]);
        });

        const fileName = `${name + '_' + DateTime.uuid()}.xlsx`;
        const savePath = Utils.getCacheFolder('export', true);

        Utils.mkDir(savePath);

        writeFile({
            SheetNames,
            Sheets: worksheet
        }, savePath + fileName);

        return fileName;
    }

}

export default Excel;
