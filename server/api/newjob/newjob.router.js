import router			from 'express';
import * as controller	from './newjob.controller';
import {verifyUser}		from '../../auth/auth-util';

const NewjobRouter = router();

NewjobRouter.post('/createJob', verifyUser, controller.createJob);

export default NewjobRouter;