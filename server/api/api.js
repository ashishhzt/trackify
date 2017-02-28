import router			from 'express';
import UserRouter		from './users/user.router';
import MembersRouter	from './members/members.router';
import JobsRouter       from './jobs/jobs.router';
import NewJobRouter     from './newjob/newjob.router'

const ApiRouter = router();

ApiRouter.use('/users',	UserRouter);
ApiRouter.use('/members', MembersRouter);
ApiRouter.use('/jobs', JobsRouter);
ApiRouter.use('/newjob', NewJobRouter);

export default ApiRouter;