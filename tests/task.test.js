const request = require('supertest');
const Task = require('../src/models/Task');
const {
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  setupDB,
} = require('./fixtures/db');

const app = require('../src/app');

beforeEach(setupDB);

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({ description: 'New task' })
    .expect(201);

  const task = await Task.findById(response.body._id);

  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('Should get user tasks', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});

test('User should be able to delete a task', async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const task = await Task.findById(taskOne._id);
  expect(task).toBeNull();
});

test('User should not be able to delete a task created by another user', async () => {
  await request(app)
    .delete(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskTwo._id);
  expect(task).not.toBeNull();
});
