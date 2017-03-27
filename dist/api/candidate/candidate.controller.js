import _      from 'lodash';
import fs     from 'fs';
import path   from 'path';
import async  from 'async';

import config	from '../../config/config';
import mongoutil from '../../util/mongo';

export const allInternalDataCandidateList = function(req, res) {
    // var skip = req.params.skip;

    // var query = "select distinct c.CANDIDATE_ID as candidateId, c.CANDIDATE_NAME as candidateName, c.COMPANY_NAME as presentEmployer, c.COLLEGE as college from candidate c, candidate_job_mapping cjm, job j where j.JOB_ID=cjm.JOB_ID and c.CANDIDATE_ID=cjm.CANDIDATE_ID";
    // db.query(query, function(error, data) {
    //     if (error) {
    //         console.log(error);
    //         return res.status(400).send("ERROR");
    //     } else {
    //         var resObj = {"count": data.length};
    //         resObj.data = [];

    //         if(data.length !=0 && req.params.skip >= data.length) {
    //             res.send(resObj);
    //         } else {
    //             let ctr = 0;
    //             for(let i=skip; i<data.length; i++){
    //                 resObj.data.push(data[i]);
    //                 ctr++;
    //                 if(ctr === 50)
    //                     break;
    //             }
    //             res.json(resObj);
    //         }
    //     }
    // });     
    // res.json({"data": [], count: 0});
    let db = mongoutil.getDb();

    var collection = db.collection('candidate');
    collection.find({}).skip(parseInt(req.params.skip)).toArray(function (err, docs) {
        var response = {};
        if (err) {
            res.send(err);
        }
        if (docs.length > 0) {
            response = {
                "count": docs.length,
                data: []
            };
             docs.forEach(row => response.data.push(row));

            // if(docs.length !=0 && req.params.skip >= docs.length) {
            //     response = resObj;
            // } else {
            //     let ctr = 0;
            //     for(let i=skip; i<docs.length; i++){
            //         resObj.data.push(data[i]);
            //         ctr++;
            //         if(ctr === 50)
            //             break;
            //     }
            //    response = resObj;
            // }
            
            
        } else {
            response.message = 'No candidates found '
        }
        res.send(response);
    });
    
};

export const invalidRequest = function(req, res) {
    res.send({"message": "Invalid Request"});
};