require('./src/db/mongoose');
const Task = require('./src/models/task');

Task.findByIdAndDelete('65d8b6268f76577c31424117')
	.then((res) => {
		console.log(res);

		return Task.countDocuments({ complete: false });
	})
	.then((count) => {
		console.log(count);
	})
	.catch((e) => {
		console.log(e);
	});
