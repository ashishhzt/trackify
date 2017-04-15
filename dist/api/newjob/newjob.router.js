import router			from 'express';
import * as controller	from './newjob.controller';
import {verifyUser}		from '../../auth/auth-util';

const NewjobRouter = router();

NewjobRouter.post('/createJob', verifyUser, controller.createJob);

NewjobRouter.post('/updateJob', verifyUser, controller.updateJob);

NewjobRouter.post('/createClient', verifyUser, controller.createClient);

NewjobRouter.post('/getClients', verifyUser, controller.getClients);


export default NewjobRouter;