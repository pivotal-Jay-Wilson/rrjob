import { default as axios}  from 'axios';
import { CheerioWrapper } from './ch'
import * as Parser from 'rss-parser';
import { ILink } from './link.interface';
import * as log4js from 'log4js';
import * as moment from 'moment';

const parser = new Parser();
const logger = log4js.getLogger();
logger.level = 'info';

export function runAll(){
    // pivotal.io/blog
    getPiv()
    
    // blogs.vmware.com
     getVmware()

    // starkandwayne.com/blog
     getSaW()

    //  pivotal.io/security/rss
     getSecurity()

    // www.brighttalk.com
    getBt()

    // engineering.pivotal.io
    getPe()
    
    // thenewstack.io
    getNs()

}
 
async function getPiv(){
    const response = await axios.get('https://pivotal.io/blog');
    const root =  new CheerioWrapper(response.data, 'div.item a');
    //const items = root.search('div.item a'); 
    //console.log(items); 
    for (const item of root) {
        //console.log(item);
        if (item.children[0] && item.children[0].data){
            const date = await getDate(item.attribs.href);
            let m = moment(date, 'MMMM DD, YYYY');
            let link:ILink = {
                title: item.children[0].data,
                url:  item.attribs.href.trim(),
                createdAt: new Date(),
                authorId: "automated",
                categoryId: "unknown",
                mediaDt:  m.toDate()
            }
            //console.log(link);
            postLink(link);            
        }       
    }
}

async function getDate(href: string) {
    const response = await axios.get(href);
    const root =  new CheerioWrapper(response.data, 'span.date');
    return root.html();
}
 
async function getVmware() {
  let feed = await parser.parseURL('https://blogs.vmware.com/wprss');
  console.log(feed.title);
 
  feed.items.forEach(item => {
    //console.log(item.isoDate + item.title + ':' + item.link)
    let m = moment(item.isoDate);
    let link:ILink = {
        title: item.title ,
        url: item.link,
        createdAt: new Date(),
        authorId: "automated",
        categoryId: "unknown",
        mediaDt:  m.toDate()
    }
    //console.log(link);
    postLink(link);                
  });
}

async function getSecurity(){
 
    let feed = await parser.parseURL('https://pivotal.io/security/rss');
    console.log(feed.title);
   
    feed.items.forEach(item => {
      console.log(item.title + ':' + item.link)
    });
   
}

async function getSaW(){
    const response = await axios.get('https://starkandwayne.com/blog');
    //const root =  cheerio.load(response.data);
    const items =  new CheerioWrapper(response.data, 'article div[class="head post-item-title"]');
    //console.log(items);
    for (const item of items) {
        let anchor = items.findFirst(item, 'h2 a').attribs;
        let date = items.findFirst(item, '.dated').attribs;
        let dt = Object.keys(date).find(k=>k.startsWith('datetime-'));
        dt = dt.substring(dt.indexOf('-') + 1, dt.length)
        let m = moment(dt);
        let link:ILink = {
            title: anchor.title ,
            url: `https://starkandwayne.com/${anchor.href}`,
            createdAt: new Date(),
            authorId: "automated",
            categoryId: "unknown",
            mediaDt:  m.toDate()
        }
        //console.log(link);
        postLink(link); 
    }
 
}

async function getBt(){
    const response = await axios.get('https://www.brighttalk.com/webcasts/');
    //const root =  cheerio.load(response.data);
    const items =  new CheerioWrapper(response.data, 'li.communicationWrapper');
    //console.log(items);
    for (const item of items) {      
       let anchor = items.findFirst(item, 'div a.detailsWrapper').attribs;
        let title = items.findFirst(item, 'div a.detailsWrapper span.webcast-title');
        let date = items.findFirst(item, 'span[class="startDate upcomingDate"] span[class="BTDate date"]')?.firstChild?.data;
        // console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@");
        // console.log(`https://www.brighttalk.com/webcasts${anchor.href}`);
        // console.log(title.firstChild.data);
        if (date){
            let m = moment(date, "MMM DD YYYY");
            let link:ILink = {
                title: title.firstChild.data,
                url: `https://www.brighttalk.com/webcasts${anchor.href}`,
                createdAt: new Date(),
                authorId: "automated",
                categoryId: "unknown",
                mediaDt:  m.toDate()
            }
            //console.log(link);
            postLink(link);     
        }
    }
 
}

async function getPe() {
    const response = await axios.get('https://engineering.pivotal.io/');
    const items =  new CheerioWrapper(response.data, 'li[class="list-timeline-item post"]');
    for (const item of items) {
        let anchor = items.findFirst(item, 'span[class="list-timeline-title post"] a.h3');
        let date = items.findFirst(item, 'div[class="list-timeline-date"] time').firstChild.data;
        if (date){
            let m = moment(date, "MMM DD YYYY");
            let link:ILink = {
                title: anchor.firstChild.data.trim(),
                url: `https://engineering.pivotal.io/${anchor.attribs.href}`,
                createdAt: new Date(),
                authorId: "automated",
                categoryId: "unknown",
                mediaDt:  m.toDate()
            }
            //console.log(link);
            postLink(link);     
        }
    }
}

async function getNs() {
    const response = await axios.get('https://thenewstack.io/');
    const items =  new CheerioWrapper(response.data, 'div[class="normalstory-box"] header[class="title-row"]');
    for (const item of items) {
        let anchor = items.findFirst(item, 'h2[class="small"] a');
        let date = items.findFirst(item, 'h4[class="timestamp"]');
        let datestr  = date.firstChild.data.trim()
        datestr = datestr.substring(0,datestr.indexOf(','));
        let m = moment(datestr, 'DD MMM YYYY h:mma');
        let link:ILink = {
            title: anchor.firstChild.data.trim(),
            url: anchor.attribs.href,
            createdAt: new Date(),
            authorId: "automated",
            categoryId: "unknown",
            mediaDt:  m.toDate()
        }
        console.log(link);
        postLink(link);
    }
}

async function postLink(link: ILink){
    try {
        const response = await axios.post('http://localhost:3000/Links', link);    
    } catch (error) {
        logger.error(error);
    }
}


