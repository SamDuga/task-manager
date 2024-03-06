const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const User = require('../../src/models/user');
const Task = require('../../src/models/task');

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
	_id: userOneId,
	name: 'Shelby',
	email: 'phillips.shelby.jo@gmail.com',
	password: 'HappyZebra123!',
	tokens: [
		{
			token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET),
		},
	],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
	_id: userTwoId,
	name: 'Sam',
	email: 'sam.duga@gmail.com',
	password: 'HappyZebra456!',
	tokens: [
		{
			token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET),
		},
	],
};

const taskOne = {
	_id: new mongoose.Types.ObjectId(),
	description: 'First task',
	completed: false,
	owner: userOne._id,
};

const taskTwo = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Second task',
	completed: true,
	owner: userOne._id,
};

const taskThree = {
	_id: new mongoose.Types.ObjectId(),
	description: 'Third task',
	completed: false,
	owner: userTwo._id,
};

const setupDB = async () => {
	await Task.deleteMany({});
	await User.deleteMany({});

	await new User(userOne).save();
	await new User(userTwo).save();
	await new Task(taskOne).save();
	await new Task(taskTwo).save();
	await new Task(taskThree).save();
};

module.exports = {
	userOneId,
	userTwoId,
	userOne,
	userTwo,
	taskOne,
	taskTwo,
	taskThree,
	setupDB,
};
