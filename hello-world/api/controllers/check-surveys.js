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
  checkSurveys: checkSurveys
}

function processSurveys(surveys) {

  return {
        surveyTitle: surveys.name,
        surveyInstanceID: surveys.id,
        nextDueAt: surveys.startTime,
        okayToStart: moment() < surveys.endTime && moment() > surveys.startTime
    };
}

function checkSurveys(req, res) {

  const currentDate = new Date();
  let currentPatient = null;
  var userPIN = req.swagger.params.userPIN.value;

   connection.query('SELECT * from patient where pin = ?', [userPIN] ,function(err, patient, fields) {
        connection.query('SELECT *, si.id FROM survey_instance AS si JOIN patient AS pa '+
              'ON si.patientId = pa.id JOIN survey_template AS st ON si.surveyTemplateId = st.id '+
              'WHERE pa.pin = ? AND ? BETWEEN si.startTime AND si.endTime AND ( '+
              'si.state = "pending" OR si.state = "in progress" ) ORDER BY si.startTime', [userPIN, currentDate.toISOString()], function(err, surveys, fields) {

          var processedSurvey = surveys.map(processSurveys);
              res.json(processedSurvey);
          });
    });

   }
