import Newjob from './newjob.model';
import _    from 'lodash';

export const createJob = (req, res, next) => {
  var newNewjob = req.body;

  Newjob.create(newNewjob)
    .then((created) => {
      res.send(created);
    }, next);
};