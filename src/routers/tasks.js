const express = require('express');
const Task = require('../models/Task');
const authMiddleware = require('../middleware/auth');

const router = new express.Router();

router.post('/tasks', authMiddleware, async (req, res) => {
  try {
    const newTask = new Task({
      ...req.body,
      owner: req.user._id,
    });
    await newTask.save();
    res.status(201).send(newTask);
  } catch (error) {
    res.status(400).send(error);
  }

  /*   const newTask = new Task(req.body);
  newTask
    .save()
    .then((result) => {
      res.status(201).send(newTask);
    })
    .catch((err) => {
      res.status(400).send(err);
    }); */
});

// GET /task?completed=[Boolean]
// GET /task?limit=[Integer]
// GET /task?skip=[Integer]
// GET /task?sortBy=[String] -> field_asc || field_desc
router.get('/tasks', authMiddleware, async (req, res) => {
  const queryParams = req.query;
  const match = {};
  const sort = {};

  if (queryParams.hasOwnProperty('completed')) {
    match.completed = queryParams.completed === 'true';
  }

  if (queryParams.hasOwnProperty('sortBy')) {
    const [field, order] = queryParams.sortBy.split('_');
    sort[field] = order === 'desc' ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: {
          limit: parseInt(queryParams.limit),
          skip: parseInt(queryParams.skip),
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send();
  }

  /*   Task.find({})
    .then((tasks) => {
      res.send(tasks);
    })
    .catch((err) => {
      res.status(500).send(err);
    }); */
});

router.get('/tasks/:tasksId', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.tasksId,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }

  /*   Task.findById(req.params.tasksId)
    .then((task) => {
      if (!task) {
        return res.status(404).send();
      }

      res.send(task);
    })
    .catch((err) => {
      res.status(500).send(err);
    }); */
});

router.patch('/tasks/:tasksId', authMiddleware, async (req, res) => {
  const newData = req.body;

  const updates = Object.keys(newData);
  const allowedUpdates = ['description', 'completed'];

  const isValid = updates.every((update) => {
    return allowedUpdates.includes(update);
  });

  if (!isValid) {
    return res.status(400).send({
      error: 'Invalid updates',
    });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.tasksId,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = newData[update]));
    await task.save();
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete('/tasks/:tasksId', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.tasksId,
      owner: req.user._id,
    });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
