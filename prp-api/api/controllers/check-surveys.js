'use strict';

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

function processSurveys(survey) {

  return {
        surveyTitle: survey.name,
        surveyInstanceID: survey.id,
        nextDueAt: survey.startTime,
        okayToStart: moment() < survey.endTime && moment() > survey.startTime,
        _links: { self: {
                         href: "/patient/"+survey.userPIN+"/surveys",
                         type: "application/json"
                       },
                  survey: {
                        href: "/survey/"+survey.id,
                        type: "application/json"
                      }
        }
    };
}

function checkSurveys(req, res) {

  const currentDate = new Date();
  let currentPatient = null;
  var userPIN = req.swagger.params.userPIN.value;

        connection.query('SELECT *, pa.pin AS userPIN ,si.id FROM survey_instance AS si JOIN patient AS pa '+
              'ON si.patientId = pa.id JOIN survey_template AS st ON si.surveyTemplateId = st.id '+
              'WHERE pa.pin = ? AND ? BETWEEN si.startTime AND si.endTime AND ( '+
              'si.state = "pending" OR si.state = "in progress" ) ORDER BY si.startTime', [userPIN, currentDate.toISOString()], function(err, surveys, fields) {

                var processedSurveys = surveys.map(processSurveys);

                res.json(processedSurveys);
          });

   }
