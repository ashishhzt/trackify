import Newjob from './newjob.model';
import _    from 'lodash';

export const params = (req, res, next, id) => {
  Newjob.findById(id)
    .exec()
    .then((newjob) => {
      if (!newjob) {
        return res.status(400).send({ message: 'Newjob not found' });
      } else {
        req.newjob = newjob;
        next();
      }
    }, next);
};

export const get = (req, res, next) => {
  Newjob.find({})
    .exec()
    .then((newjobs) => {
      res.send(newjobs);
    }, next);
};

export const getOne = (req, res) => {
  res.send(req.newjob);
};

export const post = (req, res, next) => {
  var newNewjob = req.body;

  Newjob.create(newNewjob)
    .then((created) => {
      res.send(created);
    }, next);
};

export const put = (req, res, next) => {
  var {newjob, body} = req;

  _.merge(newjob, body);

  newjob.save()
    .then((updated) => {
      res.send(updated);
    }, next);
};

export const del = (req, res, next) => {
  req.newjob.remove()
    .then((removed) => {
      res.send(removed);
    }, next);
};