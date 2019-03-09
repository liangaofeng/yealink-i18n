import Config from '../config';
import {connect, connection} from "mongoose";

const {url, name} = Config.database;
const options = {
    useNewUrlParser: true,
    useCreateIndex: true
};
const DB_URL: string = `${url + name}`;

class DB {

    constructor() {

    }

    public static connect(): void {
        connection.on('error', console.error.bind(console, 'connection error:'));
        connection.on('open', function () {
            console.log(`mongoose connected`)
        });
        connect(DB_URL, options);
    }
}

export default DB;