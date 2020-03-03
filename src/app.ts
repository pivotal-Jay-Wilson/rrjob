
import * as figlet from 'figlet';
import * as minimist from 'minimist';
import { runAll } from './load';
import * as log4js from 'log4js';
import * as http from 'http';
import * as url from 'url';

const argv = minimist(process.argv.slice(2))['_'];
const logger = log4js.getLogger();
logger.level = 'info';
logger.info('\n' + figlet.textSync('ReadingRoom', { horizontalLayout: 'full' }));
switch (argv[0]) {
    case 'load':
        runAll();
        break;
    case 'hold':
      logger.info("on hold");      
      const server = http.createServer((req:any, res:any)=>{
        const u = url.parse(req.url, true);
        if (u.pathname.startsWith('/stop')) {
          server.close();
        }
        res.end(u.pathname);
        console.log("here")
      });
      server.listen({
        host: 'localhost',
        port: 8085,
        exclusive: true
      });      
      break;      
      //while (true) {}
    default:
        logger.info("unknown");
        break;
}

