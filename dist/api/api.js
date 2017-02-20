import router			from 'express';
import UserRouter		from './users/user.router';
import MembersRouter	from './members/members.router';
import JobsRouter    from './jobs/jobs.router';

const ApiRouter = router();

ApiRouter.use('/users',	UserRouter);
ApiRouter.use('/members', MembersRouter);
ApiRouter.use('/jobs', JobsRouter);

export default ApiRouter;