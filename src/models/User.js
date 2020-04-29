const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./Task');

const jwtSecret = process.env.JWT_SECRET;

const userDefinition = {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    validate: (value) => {
      if (value < 0) {
        throw new Error('Age must be a positive number');
      }
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate: (value) => {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    minlength: 6,
    trim: true,
    validate: (value) => {
      if (validator.contains(value, 'password')) {
        throw new Error('Word "Password" isn\'t a valid password');
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  avatar: {
    type: Buffer,
  },
};

const options = {
  timestamps: true,
};

const userSchema = new mongoose.Schema(userDefinition, options);

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id', // Field in this collection
  foreignField: 'owner', // Field in the external colection (ref)
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

userSchema.methods.generateToken = function () {
  const token = jwt.sign({ _id: this._id.toString() }, jwtSecret, {
    expiresIn: '7 days',
  });

  this.tokens = this.tokens.concat({
    token,
  });
  this.save();

  return token;
};

userSchema.methods.toJSON = function () {
  const userObj = this.toObject();
  delete userObj.tokens;
  delete userObj.password;

  if (userObj.avatar) {
    userObj.avatar = `/users/${userObj._id}/avatar`;
  }

  return userObj;
};

// Hash plain text password before saving
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }

  next();
});

// Deletes tasks created by the user when the user is removed
userSchema.pre('remove', async function (next) {
  await Task.deleteMany({
    owner: this._id,
  });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
