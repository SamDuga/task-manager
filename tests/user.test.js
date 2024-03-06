const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');

const { userOne, setupDB } = require('./fixtures/db');

beforeEach(async () => {
	await setupDB();
});

test('Should sign up a new user', async () => {
	const response = await request(app)
		.post('/users')
		.send({
			name: 'Randy',
			email: 'randy.jackson@gmail.com',
			password: 'TestPass123!',
		})
		.expect(201);

	const user = await User.findById(response.body.user._id);
	expect(user).not.toBeNull();

	expect(response.body).toMatchObject({
		user: {
			name: 'Randy',
			email: 'randy.jackson@gmail.com',
		},
		jwt: user.tokens[0].token,
	});

	expect(user.password).not.toBe('TestPass123!');
});

test('Should login existing user', async () => {
	const response = await request(app)
		.post('/users/login')
		.send(userOne)
		.expect(200);

	const user = await User.findById(response.body.user._id);

	expect(response.body.jwt).toBe(user.tokens[1].token);
});

test('Should reject a nonexistent user', async () => {
	await request(app)
		.post('/users/login')
		.send({
			email: 'sduga@test.com',
			password: 'TestPass123!',
		})
		.expect(400);
});

test('Should retrieve user profile for existing user', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send(userOne)
		.expect(200);
});

test('Should not retrieve user profile for unauthenticated user', async () => {
	await request(app).get('/users/me').send(userOne).expect(401);
});

test('Should delete account for existing', async () => {
	await request(app)
		.delete('/users')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send(userOne)
		.expect(200);

	const user = await User.findById(userOne._id);
	expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
	await request(app).delete('/users').send(userOne).expect(401);
});

test('Should upload an avatar image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.attach('avatar', 'tests/fixtures/snax.jpg')
		.expect(200);

	const user = await User.findById(userOne._id);
	expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
	const response = await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({ name: 'Randy', age: 22 })
		.expect(200);

	expect(response.body.name).toBe('Randy');

	expect(response.body.age).toBe(22);
});

test('Should not update invalid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', `Bearer ${userOne.tokens[0].token}`)
		.send({ location: 'La Crosse' })
		.expect(400);
});

//
// User Test Ideas
//
// Should not signup user with invalid name/email/password
// Should not update user if unauthenticated
// Should not update user with invalid name/email/password
// Should not delete user if unauthenticated
