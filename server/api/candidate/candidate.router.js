import router from 'express';
import * as controller from './candidate.controller';
import { verifyUser } from '../../auth/auth-util';

const CandidateRouter = router();

CandidateRouter.get('/allInternalDataCandidateList/:skip', controller.allInternalDataCandidateList);
CandidateRouter.get('/getAllActiveJobs', controller.getAllActiveJobs);
CandidateRouter.post('/moveCandidatesToActiveJobs', controller.moveCandidatesToActiveJobs);

//Discarded APIs
CandidateRouter.all('/*', controller.invalidRequest);

export default CandidateRouter;
