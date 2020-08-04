
const baseurl = 'https://decisions.fct-cf.gc.ca';
const frameactive = '?iframe=true';

const cheerio = require('cheerio')
const rp = require('request-promise');
const fs = require('fs');
const http = require('http');
const winston = require('winston'); 

const BaseDirectory = 'E:\\dev\\Federal-Ruling-Summaries-Bot';
const ExportPath = BaseDirectory + '\\database';
const DatabaseArticlePath = ExportPath +'\\articles';
const DatabaseSummaryPath = ExportPath + '\\summaries';

const SMMRY_API_KEY = 'C9E3526703';
const SMMRY_LENGTH = '15';


//Winston https://www.digitalocean.com/community/tutorials/how-to-use-winston-to-log-node-js-applications



Scrape();
setInterval(Scrape, 3600000) // run once ever hour
//setInterval(Scrape, 10000)
//test();
//StartServer();
//Scrape();


function test () {


}


function StartServer(){

const server = http.createServer((req, res) => {
  if (req.url === '/'){
    res.write('Hello World');
    res.end();
  }
  if (req.url === '/api/courses'){
    res.write(JSON.stringify([1,2,3]));
    res.end();
  }
})



// server.on('connection', (socket) => {
// console.log('New Connection!')
// })
server.listen(3000);

console.log('Listening on port 3000...');

}

function Scrape() {

  var date = new Date();
  var current_hour = date.getHours();
  var current_minute = date.getMinutes();
  var current_seconds = date.getSeconds();
  console.log("Starting Bot at current hour: " + current_hour + ":" + current_minute + ":" + current_seconds);

  var html;
  const url = 'https://decisions.fct-cf.gc.ca/fc-cf/decisions/en/nav_date.do?page=1&iframe=true'; //for new articles
  ArticleArray = new Array();
  ArticleArray = fs.readdirSync(DatabaseArticlePath); //Load Database of current articles
  FoundInDatabase = false;

  rp(url)
    .then(function(html){
      //success!
      //console.log($('span > a', html).length);
      //console.log($('span > a', html));
      
      const $ = cheerio.load(html); // load the html in cheerio
      const ArticleHeading = $('.metadata')
      const output = ArticleHeading.find('h3').text();

      $('.subinfo h3 span a').each((i, el) => {
          const item = $(el).text();
          const link = $(el).attr('href');
          FoundInDatabase = false;
          //check if item is in database
          for (i = 0; i < ArticleArray.length; i++) {
            ArticleArray[i] = ArticleArray[i].replace(".txt", "");
            if (item.localeCompare(ArticleArray[i]) == '0'){
              FoundInDatabase = true;
              console.log(item + " was found in Database. Will not be extracted")
              break;
            }
          }
          if (FoundInDatabase == false){
            console.log(item + " was not found in Database proceeding with the article scrape.")
            fetchArticleContents(item, link);
          }
          
      });

    })
    .catch(function(err){
        console.log("Scrape didn't work. It is possible that decisia has blocked the connection due to excessive scrapes");
      //handle error
    });

}

function fetchArticleContents (input, link) {

  console.log("Entered fetchArticleContents.")
     //console.log(input);
     var ArticleHTML;
     var ArticleContent = "";
     var DocumentContent = "";
     const ArticleURL = baseurl + link + frameactive;

     rp(ArticleURL)
       .then(function(ArticleHTML){
         //success!
         
         //console.log(ArticleHTML);

         const $ = cheerio.load(ArticleHTML); // load the html in cheerio

         $('.documentcontent').each((i, el) => {
             const item = $(el).text();
             DocumentContent = DocumentContent + item;
         });

         $('.ParagNum').each((i, el) => {
             const item = $(el).text();
             ArticleContent = ArticleContent + item;
         });
         
         console.log("Exporting the file: " + input);
         exportFile(DatabaseArticlePath, input, DocumentContent);
         Summarize (input, DocumentContent, link);

         

       })
       .catch(function(err){
           console.log("fetchArticleContents didn't work")
         //handle error
       });

       //console.log(strings);

}

function Summarize (header, text, link) {

  ArticleArray = new Array();
  ArticleArray = fs.readdirSync(DatabaseSummaryPath); //Load Database of current articles
  const FoundInDatabase = false;

  //API information: https://smmry.com/partner
  const smmry = require('smmry')({ SM_API_KEY: SMMRY_API_KEY , SM_LENGTH: SMMRY_LENGTH});
  
  //const text = 'your long text goes here ...';
  var data;
  smmry.summarizeText(text)
  .then(data => {
        //console.log(data);
        string = JSON.stringify(data);
        console.log("Successfully summarized article");
        //const filename = "summarize_output";

        //Response looks like this:
        // sm_api_character_count: '1728',
        // sm_api_content_reduced: '88%',
        // sm_api_title: '',
        // sm_api_content: `In addition to making export sales of perindopril itself, Pharmachem's generic perindopril tablets were sold to the appellant, Apotex Inc., which sold the tablets in Canada and abroad. The appellants will be collectively referred to as "Apotex" in these reasons. Ii) The First Profits Trial As noted earlier, the liability judgment allowed Servier to claim either an accounting of Apotex's profits from its sale of its perindopril-containing products in Canada, or damages for the losses sustained by Servier because of Apotex's infringing activities. What remained in issue were the profits earned by Apotex from its sales of perindopril-containing products outside of Canada, in particular, sales made to Apotex's affiliates in Australia and the United Kingdom. The Federal Court further erred by failing to adequately consider evidence adduced by Apotex as to the ability and willingness of Signa, IPCA and Intas to provide Apotex with non-infringing perindopril. The Federal Court concluded in Profits #2 that Apotex could have obtained non-infringing perindopril from each of Signa, IPCA and Intas for sale to Apotex's affiliates in the UK and Australia. The Federal Court found that it was more likely that Apotex would have sent technology transfers to its own affiliates in India to enable them to manufacture non-infringing perindopril, and that this course of action would likely have delayed Apotex's entry into the British and Australian markets until after the infringing period. The Federal Court concluded that there should be no reduction to Apotex's profits over the infringing period to take the availability of non-infringing perindopril into account, and its decision in Profits #1 was thus confirmed.`,
        // sm_api_limitation: 'Waited 0 extra seconds due to API Free mode, 99 requests left to make for today.'

        const sm_api_content = JSON.stringify(data.sm_api_content);
        const sm_api_content_reduced = JSON.stringify(data.sm_api_content_reduced);
        const sm_api_limitation = JSON.stringify(data.sm_api_limitation);
        const sm_api_character_count = JSON.stringify(data.sm_api_character_count);

        
        exportFile(DatabaseSummaryPath, header, sm_api_content);
        StringSearch(header, text, link, sm_api_content, sm_api_content_reduced);


        console.log(sm_api_limitation);
  })
  .catch(err => {
        console.error(err);
   });

}



function StringSearch(header, text, link, reduced_text, percent_reduction) {
    //search strings in article, return true if found then proceed to process article summary
    var AcceptSwitch = false;
    var FoundInDatabase = false;

    //INCLUDE
    if (text.includes("Patent"))
    {
      AcceptSwitch = true;

    } else if (text.includes("Trademark"))
    {
      AcceptSwitch = true;

    } else if (text.includes("Copyright"))
    {
      AcceptSwitch = true;

    } else if (text.includes("Industrial Design"))
    {
      AcceptSwitch = true;

    } else if (text.includes("Patented Medicines (Notice of Compliance) – PM(NOC)"))
    {
      AcceptSwitch = true;
    } else if (text.includes("Olympic and paralympic marks"))
    {
      AcceptSwitch = true;

    } else if (text.includes("Trademark opposition board"))
    {
      AcceptSwitch = true;
    }
    

    //REJECT
    if (header.includes("(Citizenship and Immigration)"))
    {
      AcceptSwitch = false;
    }
    if (header.includes("(Public Safety and Emergency Preparedness)"))
    {
      AcceptSwitch = false;
    }
    if (header.includes("(National Revenue)"))
    {
      AcceptSwitch = false;
    }
    if (header.includes("(Immigration, Refugees and Citizenship)"))
    {
      AcceptSwitch = false;
    }
    if (header.includes("(Procureur général)"))
    {
      AcceptSwitch = false;
    }


    if (AcceptSwitch)
    {
      console.log("IP Article Found : " + header);
      //exportFile(header, text);

      EmailSummary(header, reduced_text, link, percent_reduction);

    }

}

function EmailSummary (header, content, linkToOriginalArticle, textReduction) {
  const nodemailer = require('nodemailer');

  //Adding paragraphs - bug here for stuff like "Dr. or No. or abbreviations"
  content = "<p>" + content + "</p>";
  content = content.split(". ").join(". </p><p>");

  try {
    var text = fs.readFileSync(BaseDirectory + '\\src\\Email_Template.html', 'utf8');
    //console.log(text);
    //console.log("size is: " + text.length)
  } catch(e) {
    console.log('Error:', e.stack);
  }

  text = text.replace("ENTER_TITLE_OF_ARTICLE_HERE", header);
  text = text.replace("ENTER_BODY_OF_ARTICLE_HERE", content);
  text = text.replace("ADD_ORIGINAL_WEBSITE_HERE", baseurl + linkToOriginalArticle);
  text = text.replace("INSERT_REDUCTION_PERCENT_HERE", textReduction);


  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'Pietracoops@gmail.com',
      pass: 'Cdefgab7!' // naturally, replace both with your real credentials or an application-specific password
    }
  });
  
  const mailOptions = {
    from: 'Pietracoops@gmail.com',
    to: 'massimo.pietracupa@gmail.com, bianca.pietracupa@gmail.com',
    //to: 'massimo.pietracupa@gmail.com',
    subject: header,
    //text: content
    attachments: [{
      filename: 'Law.jpg',
      path: BaseDirectory + '\\src\\Law.jpg',
      cid: 'Law' 
    },
    {
    filename: 'Law2.jpg',
    path: BaseDirectory + '\\src\\Law2.jpg',
    cid: 'Law2' 
    }],
    html: text
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
    console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}



function exportFile(path, filename, content){

  console.log("Exporting File to  : " + path + '\\' + filename);
  fs.writeFile(path + '\\' + filename + ".txt", content, function (err) {
    if (err) throw err;
    console.log('Saved!');
  });


}




