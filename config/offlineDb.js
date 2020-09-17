var mongoose = require('mongoose');

const offlineDB = async () => {
	try {
		await mongoose.connect('mongodb://localhost/dev-connector', {
			useNewUrlParser: true,
			useFindAndModify: false,
			useCreateIndex: true,
			useUnifiedTopology: true
		});

		console.log('Offline Database MongoDb connected');
	} catch (error) {
		console.log(error.message);
		process.exit(1);
	}
};

module.exports = offlineDB;
