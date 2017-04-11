import Newjob from './newjob.model';
import _    from 'lodash';
import path   from 'path';
import config	from '../../config/config';
import mongoutil from '../../util/mongo';
import upload from '../../util/multer';
var jdFilesPath = path.join(__dirname, '../../jd_files');

export const createClient = function(req, res) {
  	var newClient = req.body;

  // Newjob.create(newNewjob)
  //   .then((created) => {
  //     res.send(created);
  //   }, next);



	let db = mongoutil.getDb();

	var collection = db.collection('client');
	collection.insertOne(newClient, function(err, result) {
        var response = {};
			 if (err) {
			    response.insertError = err;
			}
			if (result.insertedCount) {
			    response.message = 'ADD SUCCESS';
			    response.clientId = result.insertedId;
			} else {
			    response.message = 'ADD FAILURE';
			}     

        res.send(response);
    });
};

export const createJob = function(req, res) {

    // var query = "select USER_ID as userId,NAME as userName from USER";
    // db.query(query, function(error, data) {
    //     if (error) {
    //         console.log(error);
    //         return res.status(400).send("ERROR");
    //     }
    //     res.json({ data: data });
    // });
    let db = mongoutil.getDb();

    var collection = db.collection('job');


        	// "_id" : 5,
// 	"clientName" : "Google",
// 	"designation" : "Software Developer",
// 	"minExp" : 2,
// 	"maxExp" : 4,
// 	"active" : true,
// 	"comments" : "",
// 	"userId" : 1,
// 	"createdOn" : "2017-01-23 13:32:21",
// 	"primarySkill" : "NODEJS",
// 	"locations" : [
// 		"Chennai",
// 		"Bangalore"
// 	],
// 	"maxCtc" : 5.4

 var jobCount=0

     db.collection('job').find().count(function(err, count){
     	if(!err)
     	{

     		jobCount=count+1
     	}


    var data = {
		...req.body,
    	"_id":jobCount,
		"active" : true,
    };
    
     if(req.file)
     {
	     upload(req, res, function(err) {
	        if (err) {
	            res.send({ "message": "ERROR" });
	        } else {

	                //     "originalFileName": req.file.originalname,
	                // "hashFileName": req.file.filename,
	                // "encoding": req.file.encoding,
	                // "mimetype": req.file.mimetype,
	                // "uploadDate": req.body.uploadDate

	            var oldPath = path.resolve(jdFilesPath, req.file.filename);
	            var newPath = path.resolve(jdFilesPath, req.file.filename);
	            if(req.file.mimetype == "application/msword"){
	                newPath = newPath+".doc";
	                req.file.filename = req.file.filename+".doc";
	            } else if(req.file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
	                newPath = newPath+".docx";
	                req.file.filename = req.file.filename +".docx";
	            } else if(req.file.mimetype == "application/pdf"){
	                newPath = newPath+".pdf"
	                req.file.filename = req.file.filename +".pdf"
	            }

	              var response={};
	            fs.rename(oldPath, newPath, function (err) {
	                if(err){
	// <<<<<<< From itz branch
	                    response.renameFileError = err;
	                    res.send(response);
	// =======
	//                     console.log(err);
	//                     res.json({"message": "ERROR"});
	// >>>>>>> From master (After march 3 commit's merge)
	                } else {


						    collection.insertOne(data, function(err, result) {
						        var response = {};
									 if (err) {
									    response.insertError = err;
									}
									if (result.insertedCount) {
									    response.message = 'ADD SUCCESS';
									    response.jobId = result.insertedId;
									} else {
									    response.message = 'ADD FAILURE';
									}     

						        res.send(response);
						    });
						}
					});
				}
			});
		}
		else{
			
			 collection.insertOne(data, function(err, result) {
						        var response = {};
									 if (err) {
									    response.insertError = err;
									}
									if (result.insertedCount) {
									    response.message = 'ADD SUCCESS';
									    response.jobId = result.insertedId;
									} else {
									    response.message = 'ADD FAILURE';
									}     

						        res.send(response);
						    });
		}
     })
};

export const getClients = function(req, res) {

    // var query = "select USER_ID as userId,NAME as userName from USER";
    // db.query(query, function(error, data) {
    //     if (error) {
    //         console.log(error);
    //         return res.status(400).send("ERROR");
    //     }
    //     res.json({ data: data });
    // });
    let db = mongoutil.getDb();

    var collection = db.collection('client');
    collection.find({}).toArray(function(err, docs) {
        var response = {};
        if (err) {
            res.send(err);
        }
        response = docs;
        res.send(response);
    });
};