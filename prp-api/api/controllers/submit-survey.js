'use strict';

var util = require('util');
var mysql = require('mysql');
var moment = require('moment');

var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'root',
   database : 'prp_development'
 });

module.exports = {
  submitSurvey: submitSurvey
}

function submitSurvey(req, res) {

    console.log(req.body);

}
