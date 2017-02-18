import Jobs from './jobs.model';
import _    from 'lodash';

export const params = (req, res, next, id) => {
  Jobs.findById(id)
    .exec()
    .then((jobs) => {
      if (!jobs) {
        return res.status(400).send({ message: 'Jobs not found' });
      } else {
        req.jobs = jobs;
        next();
      }
    }, next);
};

export const get = (req, res, next) => {
  Jobs.find({})
    .exec()
    .then((jobss) => {
      res.send(jobss);
    }, next);
};

export const getOne = (req, res) => {
  res.send(req.jobs);
};

export const post = (req, res, next) => {
  var newJobs = req.body;

  Jobs.create(newJobs)
    .then((created) => {
      res.send(created);
    }, next);
};

export const put = (req, res, next) => {
  var {jobs, body} = req;

  _.merge(jobs, body);

  jobs.save()
    .then((updated) => {
      res.send(updated);
    }, next);
};

export const del = (req, res, next) => {
  req.jobs.remove()
    .then((removed) => {
      res.send(removed);
    }, next);
};