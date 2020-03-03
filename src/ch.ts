import * as cheerio from 'cheerio';

export class  CheerioWrapper {
    private cheerio:Cheerio;
    constructor(parameters: string | Buffer, selector:string) {
        let c = cheerio(parameters)
        this.cheerio = c.find(selector);
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.cheerio.length; i += 1) {
          yield this.cheerio[i];
        }
    }

    findFirst(element: CheerioElement, selector: string) {
        return this.cheerio.filter(element).find(selector)[0];
    }

    html(){
        return this.cheerio.html();
    }
} 