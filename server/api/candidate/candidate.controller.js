import _ from 'lodash';
import fs from 'fs';
import path from 'path';
import async from 'async';

import config from '../../config/config';
import mongoutil from '../../util/mongo';

export const allInternalDataCandidateList = function (req, res) {
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
/**
 * REQUEST_PARAMS:
 * RESPONSE: _id, clientName, designation, userId
 */
export const getAllActiveJobs = function (req, res) {
    let db = mongoutil.getDb();
    let collection = db.collection('job');
    collection.find({ "active": true }, { _id: 1, clientName: 1, designation: 1, userId: 1 }).toArray(function (err, results) {
        if (err) {
            res.send({ "message": "Error occured", "description": err });
            return;
        }
        res.send(results);
    });
}

/**
 * REQUEST_BODY: userId, jobId, candidateIDs
 * RESPONSE: message, description*
 */
export const moveCandidatesToActiveJobs = function (req, res) {
    if (!(req.body.userId && req.body.jobId && req.body.candidateIDs)) {
        res.status(400).send({ "message": "Bad Request" });
        return;
    }
    let reqObject = { "userId": req.body.userId, "jobId": req.body.jobId, "candidateIDs": req.body.candidateIDs };

    let db = mongoutil.getDb();
    let collection = db.collection('candidate');
    collection.aggregate(
        [{ '$match': { '_id': { '$in': reqObject.candidateIDs }, 'jobs.jobId': reqObject.jobId } },
        { '$unwind': '$jobs' },
        { '$group': { '_id': '$_id' } }]).toArray(function (err, docs) {
            if (err) {
                res.send(err);
                return;
            }
            var validCandidateIds = [];
            for (let i = 0; i < reqObject.candidateIDs.length; i++) {
                let flag = false;
                for (let j = 0; j < docs.length; j++) {
                    if (docs[j]._id === reqObject.candidateIDs[i]) {
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    validCandidateIds.push(reqObject.candidateIDs[i]);
                }
            }
            if (validCandidateIds.length === 0) {
                res.send({ "message": "All the selected candidates are already mapped to the job" });
                return;
            }
            let arrElem = {
                "jobId": reqObject.jobId,
                "status": "NEW RESUME",
                "stage": "NEW",
                "userId": reqObject.userId,
                "recruiterId": reqObject.userId,
                "active": true,
                "timestamp": (new Date()).toMysqlFormat(),
                "interview": {},
                "statusChangedBy": req.body.recruiterId,
                "statusInputs": []
            };
            collection.updateMany({ "_id": { $in: validCandidateIds } }, { $push: { "jobs": arrElem } }, function (err, result) {
                if (err) {
                    res.send({ "message": "Error occured", "description": err });
                    return;
                }
                if (result.result.nModified) {
                    if (result.result.nModified == reqObject.candidateIDs.length) {
                        res.send({
                            "message": "Candidate application saved successfully for " + result.result.nModified
                            + " candidates."
                        });
                    } else {
                        res.send({
                            "message": "Candidate application successful for " + result.result.nModified
                            + " candidates. Application for " + (reqObject.candidateIDs.length - result.result.nModified)
                            + " candidates were rejected as they were already in process for the job."
                        })
                    }

                } else {
                    res.send({ "message": "Couldn't save now, please try later" });
                }
            });
        });
};
export const invalidRequest = function (req, res) {
    res.send({ "message": "Invalid Request" });
};