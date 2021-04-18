/** 
 * Script calls Googles Page Speed Insights API for a set of URL in order to extract Core Web Vitals KPI
 * 
 * extended by @seoseb (seoseb.de) https://www.seoseb.de/artikel/texte/pagespeed-monitoring-mit-der-psi-api/
 * Created by PageDart (https://pagedart.com)
 * Adapted from Rick Viscomi https://dev.to/chromiumdev/a-step-by-step-guide-to-monitoring-the-competition-with-the-chrome-ux-report-4k1o
 * Who Adapted it from https://ithoughthecamewithyou.com/post/automate-google-pagespeed-insights-with-apps-script by Robert Ellison
*/

// make check available to run from menu
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Core Web Vitals Monitor')
      .addItem('Monitor ausführen', 'monitor')
      .addToUi();
}

var scriptProperties = PropertiesService.getScriptProperties();
scriptProperties.setProperties({
  'pageSpeedApiKey' :  'DEIN_API_KEY', // your api key goes here
  'psAPIurl' : 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=',
  'locale' : 'de', // change loacale to your preferred language here
  'deviceStrategy' :'mobile'
  });

var ApiUrl = scriptProperties.getProperty('psAPIurl');
var ApiKey = scriptProperties.getProperty('pageSpeedApiKey');
var apiLanguage = scriptProperties.getProperty('locale');
var analysisStrategy = scriptProperties.getProperty('deviceStrategy');
var pageSpeedMonitorUrls = [ // add your urls here, e.g.: 'url-a', 'url-b' , 'url-c'

];

function monitor() {
  for (var i = 0; i < pageSpeedMonitorUrls.length; i++) {
    var url = pageSpeedMonitorUrls[i];
    var mobile = callPageSpeed(url);
    addRow(url, mobile);
  }
}

function callPageSpeed(url) {
  var pageSpeedUrl = ApiUrl + url + '&key=' + ApiKey + '&locale=' + apiLanguage + '&strategy=' + analysisStrategy;
  options = {muteHttpExceptions: true};
  var response = UrlFetchApp.fetch(pageSpeedUrl, options);
  Logger.log('fetching: ' + url);
  var ResponseCode = (response.getResponseCode());
  var json = response.getContentText();
  if(ResponseCode == 200){
      Logger.log('fetching ' + url + ': successful');
      return [JSON.parse(json), ResponseCode];
  }
  else {
     Logger.log('fetching ' + url + ' failed with: ' + ResponseCode);
     return [JSON.parse(json), ResponseCode];
  }
}

function addRow(url, mobile) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('dataCollection');
  if(mobile[1] == 200){
      var CLS = mobile[0].lighthouseResult.audits['cumulative-layout-shift'].displayValue;
      var FID = mobile[0].lighthouseResult.audits['max-potential-fid'].displayValue.replace(/\sms/g,'');
      var LCP = mobile[0].lighthouseResult.audits['largest-contentful-paint'].displayValue.replace(/\ss/g,'');
      var PSscore = mobile[0].lighthouseResult.categories.performance.score;
      sheet.appendRow([
        Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd'),
        url,
        CLS,
        FID,
        LCP,
        PSscore
      ]);
  }
  else{
        sheet.appendRow([
        Utilities.formatDate(new Date(), 'GMT', 'yyyy-MM-dd'),
        url,
        'N/A',
        'N/A',
        'N/A',
        'N/A'
      ])
  }
}


/** URLs per project instead of 
* var pageSpeedMonitorUrls = []; 
*/
var urlsProjekt1 = [ 
  'www.projekt-1.de/url/a/',
  'www.projekt-1.de/url/b/',
  'www.projekt-1.de/url/c/'
];
var urlsProjekt2 = [ 
  'www.projekt-2.de/url/a/',
  'www.projekt-2.de/url/b/',
  'www.projekt-2.de/url/c/'
];
var urlsProjekt3 = [ 
  'www.projekt-3.de/url/a/',
  'www.projekt-3.de/url/b/',
  'www.projekt-3.de/url/c/'
];

/**
 *  call monitoring function per project
 */
function monitorProjekt1 () {
 monitor(urlsProjekt1);
};
function monitorProjekt() {
 monitor(urlsProjekt2);
};
function monitorProjekt3 () {
 monitor(urlsProjekt3);
};
