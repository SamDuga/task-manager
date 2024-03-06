const express = require('express');
const router = new express.Router();
const multer = require('multer');
const sharp = require('sharp');

const auth = require('../middleware/auth');
const User = require('../models/user');
const { sendWelcome, sendCancel } = require('../emails/account');

const upload = multer({
	limits: {
		fileSize: 2000000,
	},
	fileFilter(res, file, cb) {
		if (!file.originalname.match(/\.(png|jpg|jpeg)/))
			return cb(new Error('Please provide a .png, .jpg, or .jpeg'));

		cb(undefined, true);
	},
});

// create

router.post('/users', async (req, res) => {
	const user = new User(req.body);

	try {
		await user.save();

		if (process.env.ENV === 'dev') {
			await sendWelcome(user.name);
		}

		const jwt = await user.generateJWT();

		res.status(201).send({ user, jwt });
	} catch (e) {
		res.status(400).send(e);
	}
});

// read

router.get('/users', auth, async (req, res) => {
	try {
		const users = await User.find({});
		res.status(200).send(users);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password,
		);

		const jwt = await user.generateJWT();

		res.send({ user, jwt });
	} catch (e) {
		res.status(400).send(e);
	}
});

router.post('/users/logout', auth, async (req, res) => {
	try {
		const tokenIndex = req.user.tokens.findIndex((x) => x === req.token);

		if (tokenIndex > -1) {
			req.user.tokens.splice(tokenIndex, 1);
		} else {
			res.status(401).send();
		}
		await req.user.save();

		await req.user.save();

		res.status(200).send();
	} catch (e) {
		res.status(500).send(e);
	}
});

router.post('users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();

		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});

// update

router.patch('/users/me', auth, async (req, res) => {
	const keys = Object.keys(req.body);
	const allowedKeys = ['name', 'email', 'password', 'age'];

	let invalidKeys = [];

	keys.forEach((key) => {
		if (!allowedKeys.includes(key)) {
			invalidKeys.push(`Body contains invalid key: ${key} \r\n`);
		}
	});

	if (invalidKeys.length > 0) return res.status(400).send(invalidKeys);

	try {
		keys.forEach((key) => (req.user[key] = req.body[key]));

		await req.user.save();

		res.status(200).send(req.user);
	} catch (e) {
		res.status(400).send(e);
	}
});

router.post(
	'/users/me/avatar',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({ width: 250, height: 250 })
			.png()
			.toBuffer();

		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	},
);

// delete

router.delete('/users', auth, async (req, res) => {
	try {
		await User.deleteOne(req.user._id);

		if (process.env.ENV === 'dev') {
			await sendCancel(req.user.name);
		}

		res.status(200).send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.delete('/users/me/avatar', auth, async (req, res) => {
	try {
		req.user.avatar = undefined;
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;
