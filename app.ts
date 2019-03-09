import "reflect-metadata";
import * as express from 'express';
import * as path from 'path';
import * as mongoSessionStore from 'connect-mongo';
import * as mongoose from 'mongoose';
import * as cookieParser from 'cookie-parser';
import * as morgan from 'morgan';
import * as session from "express-session";
import * as bodyParser from "body-parser";
import {useExpressServer, Action} from "routing-controllers";

import DB from "./repository/db";
import Utils from "./utils";
import {AllErrorsHandler} from "./middlewares/AllErrorsHandler";

class App {

    readonly dev: boolean = process.env.NODE_ENV !== 'production';

    public app: express.Application;

    constructor() {
        this.app = express();

        this.config();

        this.api();

        this.router();

        DB.connect();
    }

    public static run(): express.Application {
        return new App().app;
    }


    public api(): void {
        useExpressServer(this.app, {
            defaultErrorHandler: false,
            currentUserChecker: async (action: Action) => {
                return action.request.session.user;
            },
            routePrefix: "/api",
            controllers: [__dirname + `/controllers/**/*.${this.dev ? 'ts' : 'js'}`], //*{.js,.ts}
            middlewares: [AllErrorsHandler]
        });
    }

    public config(): void {
        const MongoStore = mongoSessionStore(session);
        this.app.use(session({
            store: new MongoStore({
                mongooseConnection: mongoose.connection,
                ttl: 14 * 24 * 60 * 60, // save session 14 days
            }),
            secret: 'yealink',
            resave: false,
            saveUninitialized: true,
            cookie: {
                httpOnly: true,
                maxAge: 14 * 24 * 60 * 60 * 1000
            } as any,
        }));

        this.app.use(bodyParser.json({limit: '100mb'}));
        this.app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
        this.app.use(morgan('dev'));
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended: false}));
        this.app.use(cookieParser());
        this.app.use(express.static(path.join(__dirname, './public')));

        /***
         * 程序出错时不崩溃
         */
        process.on('uncaughtException', function (err) {
            console.log('uncaughtException',err);
            console.log('uncaughtException',err.stack)
        });
    }

    public router() {
        /**
         * @api {post} /api/download 文件下载
         * @apiDescription 公用模块
         * @apiName /api/download 文件下载
         * @apiGroup Common
         * @apiParam {string} pid PID
         * @apiParam {Boolean} path 文件地址
         * @apiSuccess {json} result
         * @apiSampleRequest /api/download
         * @apiVersion 1.0.0
         */
        this.app.get('/api/download', (req, res) => {
            if (!req.query.path || req.query.path.includes('..')) {
                throw new Error('路径错误');
            }
            const file = Utils.getCacheFolder('export', true) + req.query.path;
            res.download(file);
        });
    }
}

export default App;
