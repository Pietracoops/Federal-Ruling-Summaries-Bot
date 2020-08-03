import React from 'react';
import './App.css';
import logo from './logo.svg';


function Webscrape(header, text) {
    const baseurl = 'https://decisions.fct-cf.gc.ca';
    const frameactive = '?iframe=true';
    
    const cheerio = require('cheerio')
    const rp = require('request-promise');
    const nodemailer = require('nodemailer');

    const inputArray = [];
    


    const test = () => {
        const string = "foo";
        const substring = "oo";
        
        console.log(string.includes(substring));

    };


    const SendEmail = () => {
      
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
               user: 'pietracoops@gmail.com',
               pass: 'Cdefgab7!'
           }
    });

    const mailOptions = {
      from: 'pietracoops@gmail.com', // sender address
      to: 'massimo.pietracupa@hotmail.com', // list of receivers
      subject: 'IP Article Found', // Subject line
      html: '<p>Your html here</p>'// plain text body
    };

    transporter.sendMail(mailOptions, function (err, info) {
      if(err)
        console.log(err)
      else
        console.log(info);
   });

    };


    const StringSearch = (header, text) => {

      //search strings in article, return true if found then proceed to process article summary
      var AcceptSwitch = false;
      // Patent
      // Trademark
      // Copyright
      // Industrial Design
      // Patented Medicines (Notice of Compliance) – PM(NOC)
      // Olympic and paralympic marks
      // Trademark opposition board
      // Federal Courts Rules
      
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
        SendEmail(header, text);

      }


    };



    const fetchArticleContents = (input, link) => {

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
            //console.log(DocumentContent);
            //console.log(ArticleContent);
            //inputArray.push(input, DocumentContent + ArticleContent);
            //console.log(input);
            //console.log(DocumentContent);
            StringSearch(input, DocumentContent);


          })
          .catch(function(err){
              console.log("fetchArticleContents didn't work")
            //handle error
          });

          //console.log(strings);
    };


    const Scrape = () => {
        var html;
        const url = 'https://decisions.fct-cf.gc.ca/fc-cf/decisions/en/nav_date.do?page=1&iframe=true'; //for new articles

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

                fetchArticleContents(item, link);
            });

          })
          .catch(function(err){
              console.log("Scrape didn't work")
            //handle error
          });

      };


  return (

    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
            Press the Button to Scrape Federal Court Decisions
        </p>
        <p>
        <button onClick={Scrape}>Scrape Website</button>
        <button onClick={test}>test Website</button>
        </p>
        <p>{inputArray[0]}</p>
      </header>
    </div>


  );
}

export default Webscrape;
