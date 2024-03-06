const { MailtrapClient } = require('mailtrap');

const client = new MailtrapClient({
	endpoint: process.env.MAILTRAP_ENDPOINT,
	token: process.env.MAILTRAP_TOKEN,
});

const sender = {
	email: 'mailtrap@demomailtrap.com',
	name: 'Mailtrap Testing',
};
const recipients = [
	{
		email: 'sam.duga@gmail.com',
	},
];

const sendWelcome = async (name) => {
	await client.send({
		from: sender,
		to: recipients,
		subject: 'Welcome to Task App!',
		text: `Welcome ${name}! Thanks for signing up!`,
		category: 'Welcome Email',
	});
};

const sendCancel = async (name) => {
	await client.send({
		from: sender,
		to: recipients,
		subject: 'Sorry to see you go!',
		text: `Hey ${name}! We're sorry to see you leave us! If you have a moment, would you be willing to fill out
a quick questionnaire letting us know why you left and if there's anything we can do to improve our service?`,
		category: 'Welcome Email',
	});
};

module.exports = {
	sendWelcome,
	sendCancel,
};
