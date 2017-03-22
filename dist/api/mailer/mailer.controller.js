import Mailer from './mailer.model';
import _ from 'lodash';
import * as postman from './mailer.postman';
import upload from '../../util/multer';
import path   from 'path';
import async   from 'async';

var upload_path = path.join(__dirname, 'resume_files');

export const params = (req, res, next, id) => {
    next();
};

export const get = (req, res, next) => {
    // postman.send(newMailer)
    // Mailer.find({})
    //   .exec()
    //   .then((mailers) => {
    //     res.send(mailers);
    //   }, next);
    if (req.query.label) {
        postman.inbox(req.query, function(messages) {
            res.send(messages);
        });
    } else {
        res.setStatus = 400;
        res.send({ status: 400, msg: "Bad request" });
    }
};

export const getOne = (req, res) => {
    postman.readMessage(req, function(message){
        res.send(message);
    });
    // res.send(req.mailer);
};

export const post = (req, res, next) => {
    var newMailer = req.body;
    postman.send(newMailer, function(data){
        res.send(data);
    })
    console.log(newMailer)

};

export const put = (req, res, next) => {
    var { mailer, body } = req;

    _.merge(mailer, body);

    mailer.save()
        .then((updated) => {
            res.send(updated);
        }, next);
};

export const del = (req, res, next) => {
    postman.trash(req, function(message){
        res.send(message);
    })
};

export const uploadAttachment = (req, res, next) => {
    console.log(req.file);
    upload(req, res, function(err){
        if(err){
            console.log(err);
            res.setStatus = 500;
            res.send({status:500, msg:"Unable to upload file."});
        }else{
            console.log("file uploaded successfully");
            res.send({status:200, fileName:req.file.filename, originalFileName:req.file.originalname, mimetype:req.file.mimetype});
        }
    });
}

export const modify = (req, res, next) => {
    postman.modify(req.body, function(response){
        res.send(response);
    })
}

export const counter = (req, res, next) => {
    postman.fetchCount(req.query, function(response){
        res.send(response);
    })
}

export const sendMailForJob = (req, res, next) => {
    
    // Fetch template here
    var template = {subject:"Your subject will come here", body:"Hello, {{candidate_name}}, We would like your inform  you that your profile is selected at {{company_name}} and the interview is scheduled on {{date}}. Please reply to this mail or call me at {{user_no}} if you have questions. All the best."}
    let sharedData = {};
    async.eachSeries(req.body.candidateList, (_candidate, callback) => {
        sharedData._candidate = _candidate;
        async.waterfall([fetchCandidate, sendMail], (error, response) => {
            if(error){
                callback(error);
            }else{
                callback();
            }
        })
    }, function done(error){
        if(error){
            res.send(error);
        }else{
            res.send({status:200, msg:"Mails sent successfully"});
        }
    });

    function fetchCandidate(callback){
        // Fetch candidate details and send to next fn.
        var attachments = [];
        attachments.push({originalFileName:"xyz.doc", fileName:"d18d0ea252c234284c119b90fe278683.doc"})
        callback(null, {emailId:"ashfaq@anzycareers.com", attachments:attachments})
    }

    function sendMail(candidate, callback){
        postman.send({
            mailTo:candidate.emailId,
            mailFrom:"",
            body:template.body + JSON.stringify(sharedData._candidate),
            subject:template.subject,
            attachments:candidate.attachments
        }, (data)=>{
            // Handle errors here,
            callback();
        })
    }
}

export const downloadAttachment=(req, res, next)=>{
    postman.download(req.body, function(response){
        response.mimetype = req.body.mimeType;
        response.filename = req.body.filename;
        res.send(response);
    });
}
