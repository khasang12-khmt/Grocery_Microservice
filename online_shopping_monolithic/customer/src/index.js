const express = require('express');
const { PORT } = require('./config');
const { databaseConnection } = require('./database');
const expressApp = require('./express-app');
const { CreateChannel } = require('./utils');
const errorHandler = require('./utils/errors');

const StartServer = async () => {
	const app = express();

	await databaseConnection();

	const channel = await CreateChannel();

	await expressApp(app, channel);

	errorHandler(app);

	// catch all errors and format and report to logger
	app.use((error, req, res, next) => {
		const statusCode = error.statusCode || 500;
		const data = error.data || error.message;
		return res.status(statusCode).json(data);
	});

	app.listen(PORT, () => {
		console.log('From Customer');
		console.log(`listening to port ${PORT}`);
	}).on('error', (err) => {
		console.log(err);
		process.exit();
	});
};

StartServer();
