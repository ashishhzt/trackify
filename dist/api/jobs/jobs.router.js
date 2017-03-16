import router			from 'express';
import * as controller	from './jobs.controller';
import {verifyUser}		from '../../auth/auth-util';

const JobsRouter = router();

// JobsRouter.param('id', controller.params);

// JobsRouter.route('/')
//   .get(controller.get)
//   .post(controller.post);

// JobsRouter.route('/:id')
//   .get(controller.getOne)
//   .put(controller.put)
//   .delete(controller.del);

JobsRouter.get('/getJobsDetail/:userId/:flag/:status', verifyUser, controller.getJobsDetail);

JobsRouter.post('/candidateDetailsForJob', verifyUser, controller.candidateDetailsForJob);

JobsRouter.post('/changeStatus', verifyUser, controller.changeStatus);

JobsRouter.post('/moveToNextStage', verifyUser, controller.moveToNextStage);

JobsRouter.post('/addInterviewDate', verifyUser, controller.addInterviewDate);

JobsRouter.get('/getAllActiveJobs', controller.getAllActiveJobs);

JobsRouter.post('/getSimilarJobs', verifyUser, controller.getSimilarJobs);

JobsRouter.post('/moveToActiveJob', verifyUser, controller.moveToActiveJob);

JobsRouter.post('/moveJobToActive', verifyUser, controller.moveJobToActive);
JobsRouter.post('/moveToInactiveJob', verifyUser, controller.moveToInactiveJob);

JobsRouter.get('/getResumeMetadata/:candidateId', verifyUser, controller.getResumeMetadata);

JobsRouter.post('/uploadResume', controller.uploadResume);
//Both exising & new candidate being merged to same api
JobsRouter.post('/uploadNewCandidateResume', controller.uploadResume);

JobsRouter.get('/candidateDetails/:candidateId', verifyUser, controller.candidateDetails);

JobsRouter.post('/updateCandidateDetails', verifyUser, controller.updateCandidateDetails);

JobsRouter.post('/savePostMessage', verifyUser, controller.savePostMessage);

JobsRouter.get('/feedJobData/:candidateId', verifyUser, controller.feedData);

JobsRouter.get('/getFeedThread/:jobId/:candidateId', verifyUser,  controller.getFeedThread);

JobsRouter.get('/allRecruiters', verifyUser, controller.allRecruiters);

JobsRouter.get('/linkedinLink/:candidateId', verifyUser, controller.linkedinLink);

JobsRouter.post('/internalDataCandidateList', controller.internalDataCandidateList);

//Discarded APIs
JobsRouter.all('/*', controller.invalidRequest);

export default JobsRouter;