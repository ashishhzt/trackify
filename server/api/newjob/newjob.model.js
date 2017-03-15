import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const MandateSkills = new mongoose.Schema({
  skillName: String
});

const SecondarySkills = new mongoose.Schema({
  skillName: String
});

const Locations = new mongoose.Schema({
  locationName: String
});

const Allot = new mongoose.Schema({
  allotToName: String
});

const NewjobSchema = new mongoose.Schema({
  clientName: String,
  designation: String,
  primarySkills: String,
  mandatorySkills: [ MandateSkills ],
  eitherOrSkills: [ SecondarySkills ],
  expFrom: Number,
  expTo: Number,
  ctcFrom: Number,
  ctcTo: Number,
  jobLocation: [ Locations ],
  allotTo: [ Allot ],
  createdOn: {type: Date, default: Date.now},
  isDrive: {type: Boolean, default: false}
});


export default mongoose.model('Newjob', NewjobSchema);