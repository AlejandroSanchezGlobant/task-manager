const request = require('supertest');
const User = require('../src/models/User');
const { userOne, setupDB } = require('./fixtures/db');
const app = require('../src/app');

beforeEach(setupDB);

test('Should sign up a new user', async () => {
  const newUser = {
    name: 'Alejandro',
    email: 'ale@test.com',
    password: '123456789',
  };

  const response = await request(app).post('/users').send(newUser).expect(201);

  // Assertions for DB
  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  // Assertions for response
  expect(response.body).toMatchObject({
    user: {
      name: newUser.name,
      email: newUser.email,
    },
    token: user.tokens[0].token,
  });
});

test('Should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: userOne.email,
      password: userOne.password,
    })
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.tokens[1].token).toBe(response.body.token);
});

test('Should not login nonexisting user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: 'qwerty@test.com',
      password: userOne.password,
    })
    .expect(400);
});

test('Should get user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/users/me').send().expect(401);
});

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(userOne._id);
  expect(user.avatar).toEqual(expect.any(Buffer));
});
