'use strict';

var mysql = require('mysql');

var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'root',
   database : 'prp_development'
 });

module.exports = {
  submitSurvey: submitSurvey
}

function processResponse(survey) {

  return {
          id: survey[0].id
  };

}

function submitSurvey(req, res) {

    const surveyInstanceID = req.swagger.params.body.value.surveyInstanceID;
    const questionInstArr = [];
    const currentDate = new Date();

    connection.query('SELECT * from survey_instance where id = ?', [surveyInstanceID] ,function(err, surveyInstance, fields) {
       connection.query('SELECT * from question_result',function(err, questionResults, fields) {
         connection.query('SELECT * from question_option',function(err, questionOptions, fields) {

            for (const currentQuestion of req.swagger.params.body.value.surveyResults) {

                connection.beginTransaction(function(err) {
                   connection.query('INSERT INTO question_result SET createdAt=?, updatedAt=?, surveyInstanceId=?, questionOptionId=?',
                       [currentDate, currentDate, surveyInstanceID, currentQuestion.selectedOptions[0]], function(err, result) {

                        console.log(err);

                   });

                   connection.commit(function(err) {
                     if (err) {
                      return connection.rollback(function() {
                         throw err;
                      });
                     }
                    console.log('success!');

                   });

               });
             }

            res.statusCode = 201;
            res.setHeader('Location', 'http://localhost:10010/survey');
            var processedSurveyInstances = {
                    message: 'Survey Instance Created',
                    surveyInstanceID: surveyInstance[0].id
            };

            res.json(processedSurveyInstances);
         });
      });
    });

}
