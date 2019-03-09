import {Server, createServer} from "http";
import * as debug from "debug";
import App from "../src/app";
import Utils from "../src/utils";


/**
 * Listen on provided port, on all network interfaces.
 */
const dev = process.env.NODE_ENV !== 'production';

const port: number = normalizePort(process.env.PORT || (dev ? 1494 : 1720));

const app = App.run();

/**
 * Create HTTP server.
 */

const server: Server = createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val):number {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return 3000;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error):void {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening():void {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : '' + addr.port;
    debug('server:server')('Listening on ' + bind);
    console.log('Environment : ' + process.env.NODE_ENV);
    console.log('Listening on : '+ Utils.getIp()+ ":" + bind);
}


