const express = require('express');
require('./db/mongoose');
const multer = require('multer');
const { MailtrapClient } = require('mailtrap');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const TOKEN = '2fe884fbf60d34f69d5230cb159cf9f0';
const ENDPOINT = 'https://send.api.mailtrap.io/';

const client = new MailtrapClient({ endpoint: ENDPOINT, token: TOKEN });

const sender = {
	email: 'mailtrap@demomailtrap.com',
	name: 'Mailtrap Testing',
};
const recipients = [
	{
		email: 'sam.duga@gmail.com',
	},
];

const app = express();

const upload = multer({
	dest: 'images',
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(doc|docx|txt)$/)) {
			return cb(new Error('Please upload a .doc or .docx'));
		}
		cb(undefined, true);
	},
});

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.post(
	'/upload',
	upload.single('upload'),
	(req, res) => {
		res.send();
	},
	(error, req, res, next) => {
		res.status(400).send({ error: error.message });
	},
);

app.get('/', (req, res) => {
	res.send('Working!');
});

app.get('/mailTest', async (req, res) => {
	client
		.send({
			from: sender,
			to: recipients,
			subject: 'Testing emails',
			text: 'Sample Text',
			category: 'Memery Notifications',
		})
		.then(() => {
			res.send('Test message set sucessfully');
		});
});

module.exports = app;
