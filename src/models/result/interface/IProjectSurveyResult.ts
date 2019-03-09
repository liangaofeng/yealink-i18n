import {IProjectDocument} from "../../../repository/entity/Project";

interface IProjectSurveyResult {
    translate_finish: number,
    translate_total: number,
    languages: number,
    specials: number,
    modules: number,
    key_total: number,
    key_finish: number,
    progress: number,
    project: IProjectDocument
}

export default IProjectSurveyResult;