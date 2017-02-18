import router			from 'express';
import * as controller	from './jobs.controller';

const JobsRouter = router();

JobsRouter.param('id', controller.params);

JobsRouter.route('/')
  .get(controller.get)
  .post(controller.post);

JobsRouter.route('/:id')
  .get(controller.getOne)
  .put(controller.put)
  .delete(controller.del);

export default JobsRouter;