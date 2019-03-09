class DateTime {

    private readonly pattern: string;
    private time: Date;


    constructor(time?: Date, pattern?: string) {
        this.time = time || new Date();
        this.pattern = pattern;
    }

    public format(_pattern): string {
        let pattern = _pattern || this.pattern;
        const o = {
            "M+": this.time.getMonth() + 1, //月份
            "d+": this.time.getDate(), //日
            "h+": this.time.getHours(), //小时
            "m+": this.time.getMinutes(), //分
            "s+": this.time.getSeconds(), //秒
            "q+": Math.floor((this.time.getMonth() + 3) / 3), //季度
            "S": this.time.getMilliseconds() //毫秒
        };
        if (/(y+)/.test(pattern)) {
            pattern = pattern.replace(RegExp.$1, (this.time.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (const k in o)
            if (new RegExp("(" + k + ")").test(pattern))
                pattern = pattern.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return pattern;

    }

    public static uuid(): string {
        return new DateTime().format(`yyyyMMddhhmmss`);
    }
}

export default DateTime;

