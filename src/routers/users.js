// Packages
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
// Models
const User = require('../models/User');
// Middleware functions
const authMiddleware = require('../middleware/auth');
// Email integration
const { sendWelcomeEmail, sendFarewellEmail } = require('../emails/account');

const router = new express.Router();

const upload = multer({
  //dest: 'avatars',
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error('File must be an image (png, jpg or jpeg)'));
    }

    cb(undefined, true);
  },
});

// Create user
router.post('/users', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    sendWelcomeEmail(req.body.email, req.body.name);

    const token = await newUser.generateToken();

    res.status(201).send({
      newUser,
      token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login
router.post('/users/login', async ({ body }, res) => {
  try {
    const user = await User.findByCredentials(body.email, body.password);
    const token = await user.generateToken();

    res.send({
      user,
      token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

// Logout from current session (current user)
router.post('/users/logout', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// Logout from all open sessions (current user)
router.post('/users/logoutAll', authMiddleware, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (error) {
    res.status(500).send(error);
  }
});

// Get profile data (current user)
router.get('/users/me', authMiddleware, async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update profile data (current user)
router.patch('/users/me', authMiddleware, async (req, res) => {
  const newData = req.body;

  const updates = Object.keys(newData);
  const allowedUpdates = ['name', 'email', 'password', 'age'];

  const isValid = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValid) {
    return res.status(400).send({
      error: 'Invalid updates',
    });
  }

  try {
    updates.forEach((update) => (req.user[update] = newData[update]));
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete user (current user)
router.delete('/users/me', authMiddleware, async (req, res) => {
  try {
    await req.user.remove();
    sendFarewellEmail(req.user.email, req.user.name);

    res.send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create/replace profile pic
router.post(
  '/users/me/avatar',
  authMiddleware,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();

    req.user.avatar = buffer;
    await req.user.save(), res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({
      error: error.message,
    });
  }
);

// Delete profile pic
router.delete('/users/me/avatar', authMiddleware, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

/* Get all users - This shold work only for an admin - think and refactor
router.get('/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
}); */

/* Get user by id - This shold work only for an admin - think and refactor
  router.get('/users/:userId', async (req, res) => {
  const id = req.params.userId;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});
*/

/* Update user by id - This shold work only for an admin - think and refactor
router.patch('/users/:userId', async (req, res) => {
  const id = req.params.userId;
  const newData = req.body;

  const updates = Object.keys(newData);
  const allowedUpdates = ['name', 'email', 'password', 'age'];

  const isValid = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValid) {
    return res.status(400).send({
      error: 'Invalid updates',
    });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send();
    }

    updates.forEach((update) => (user[update] = newData[update]));
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
}); */

module.exports = router;
