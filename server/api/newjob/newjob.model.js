import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const NewjobSchema = new mongoose.Schema({
  name: String
});

export default mongoose.model('Newjob', NewjobSchema);