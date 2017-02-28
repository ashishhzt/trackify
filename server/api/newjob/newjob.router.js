import router			from 'express';
import * as controller	from './newjob.controller';

const NewjobRouter = router();

NewjobRouter.param('id', controller.params);

NewjobRouter.route('/')
  .get(controller.get)
  .post(controller.post);

NewjobRouter.route('/:id')
  .get(controller.getOne)
  .put(controller.put)
  .delete(controller.del);

export default NewjobRouter;