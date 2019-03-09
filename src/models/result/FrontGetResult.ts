import {IProjectLanguage} from "../../repository/entity/Project";
import {II18nDocument} from "../../repository/entity/I18n";

interface IFrontGetResult extends IProjectLanguage {
    list?: {
        [propName: string]: string;
    }
}

class FrontGetResult implements IFrontGetResult {
    public fileName: string;
    public value: string;
    public label: string;
    public lang: string;
    public list;
    public display: boolean;
    public default: boolean;

    constructor(params: IProjectLanguage, i18ns: II18nDocument[]) {
        const {fileName, value, label, lang} = params;
        this.fileName = fileName;
        this.value = value;
        this.label = label;
        this.lang = lang;

        i18ns.forEach(x => {
            this.list[x.key] = x.values[lang] ? x.values[lang] : x.key
        });
    }
}

export default FrontGetResult;
