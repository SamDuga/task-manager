const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');

const Task = require('../models/task');

//create

router.post('/tasks', auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user._id,
	});

	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

// read

router.get('/tasks', auth, async (req, res) => {
	const match = {};
	const sort = {};

	if (req.query.completed) {
		match.completed = req.query.completed === 'true';
	}

	if (req.query.sortBy) {
		const parts = req.query.sortBy.split(':');
		sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
	}

	try {
		await req.user.populate({
			path: 'tasks',
			match,
			options: {
				limit: parseInt(req.query.limit) | 10,
				skip: parseInt(req.query.skip) | 0,
				sort,
			},
		});
		res.status(200).send(req.user.tasks);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.get('/tasks/:id', auth, async (req, res) => {
	try {
		const task = await Task.findOne({
			_id: req.params.id,
			owner: req.user._id,
		});
		if (!task) return res.status(404).send();

		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

// update

router.patch('/tasks/:id', auth, async (req, res) => {
	const keys = Object.keys(req.body);
	const allowedKeys = ['description', 'completed'];

	let invalidKeys = [];

	keys.forEach((key) => {
		if (!allowedKeys.includes(key)) {
			invalidKeys.push(`Body contains invalid key: ${key} \r\n`);
		}
	});

	if (invalidKeys.length > 0) return res.status(400).send(invalidKeys);

	try {
		const task = await Task.findOne({
			_id: req.params._id,
			owner: req.user._id,
		});

		if (!task) return res.status(404).send();

		keys.forEach((key) => (task[key] = req.body[key]));

		task.save();

		res.status(200).send(task);
	} catch (e) {
		res.status(400).send(e);
	}
});

// delete

router.delete('/tasks/:id', auth, async (req, res) => {
	try {
		const task = await Task.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id,
		});

		if (!task) return res.status(404).send();

		res.status(200).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
