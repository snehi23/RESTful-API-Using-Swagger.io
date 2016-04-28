'use strict';

var mysql = require('mysql');

var connection = mysql.createConnection({
   host     : 'localhost',
   user     : 'root',
   password : 'root',
   database : 'prp_development'
 });

module.exports = {
  getSurveys: getSurveys
}

function groupBy (array, key) {
    const groupedArray = [];

    // get unique values
    const uniqueValues = new Set(array.map((element) => {
        return element[key];
    }));

    // gather objects that have the same value
    for (const value of uniqueValues) {
        const group = array.filter((element) => {
            return element[key] === value;
        });

        groupedArray.push(group);
    }

    return groupedArray;
}

function processSurveyInstance (questionRecord) {

    console.log(questionRecord[0].sid);
    return {
        quesID: questionRecord[0].questionTemplateId,
        _links: {
                  question: {
                        href: "/survey/"+questionRecord[0].sid+"/question/"+questionRecord[0].questionTemplateId,
                        type: "application/json"
                      }
        }
    };
}

function getSurveys(req, res) {

  const currentDate = new Date();
  let currentPatient = null;
  var id = req.swagger.params.id.value;

   connection.query('SELECT * from survey_instance where id = ?', [id] ,function(err, surveyInstance, fields) {
        connection.query('SELECT * , qo.id AS qoid, si.id AS sid FROM survey_instance AS si '+
              'JOIN survey_template AS st ON st.id = si.surveyTemplateId '+
              'JOIN join_surveys_and_questions AS jsq ON jsq.surveyTemplateId = st.id ' +
              'JOIN question_template AS qt ON qt.id = jsq.questionTemplateId '+
              'JOIN question_option AS qo ON qo.questionTemplateId = qt.id WHERE si.id = ? '+
              'ORDER BY jsq.questionOrder, qo.`order`', [id], function(err, surveys, fields) {

              var processedSurveyInstances = {
                      message: 'SUCCESS',
                      surveyInstanceID: surveys[0].sid,
                      surveyName: surveys[0].name,
                      questions: groupBy(surveys, 'questionOrder').map(processSurveyInstance)
              };

              console.log(processedSurveyInstances);

              res.json(processedSurveyInstances);
        });
    });

}
