import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const JobsSchema = new mongoose.Schema({
  name: String
});

export default mongoose.model('Jobs', JobsSchema);