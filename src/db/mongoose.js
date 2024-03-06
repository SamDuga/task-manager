const mongoose = require('mongoose');

const connectionURL =
	process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/task-manager-api';

mongoose.connect(connectionURL).then(() => {
	console.log('Connected to mongoDB!');
});
