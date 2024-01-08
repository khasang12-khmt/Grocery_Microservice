const { SHOPPING_BINDING_KEY, CUSTOMER_BINDING_KEY } = require('../config');
const ShoppingService = require('../services/shopping-service');
const { PublishMsg, SubscribeMsg } = require('../utils');
const UserAuth = require('./middlewares/auth');

module.exports = (app, channel) => {
	const service = new ShoppingService();
	SubscribeMsg(channel, service, SHOPPING_BINDING_KEY);

	// Order
	app.post('/order', UserAuth, async (req, res, next) => {
		const { _id } = req.user;
		const { txnNumber } = req.body;

		try {
			const { data } = await service.PlaceOrder({ _id, txnNumber });
			const payload = await service.GetOrderPayload(
				_id,
				data,
				'CREATE_ORDER'
			);
			PublishMsg(
				channel,
				CUSTOMER_BINDING_KEY,
				JSON.stringify(payload.data)
			);
			return res.status(200).json(data);
		} catch (err) {
			next(err);
		}
	});

	app.get('/orders', UserAuth, async (req, res, next) => {
		const { _id } = req.user;

		try {
			const { data } = await service.GetOrders(_id);
			return res.status(200).json(data);
		} catch (err) {
			next(err);
		}
	});

	// Wishlist
	app.post('/wishlist', UserAuth, async (req, res, next) => {
		try {
			const { _id } = req.user;
			const { product_id } = req.body;
			const data = await service.AddToWishlist(_id, product_id);
			return res.status(200).json(data);
		} catch (error) {
			next(error);
		}
	});

	app.get('/wishlist', UserAuth, async (req, res, next) => {
		try {
			const { _id } = req.user;
			const data = await service.GetWishlist(_id);
			return res.status(200).json(data);
		} catch (error) {
			next(error);
		}
	});

	app.delete('/wishlist/:id', UserAuth, async (req, res, next) => {
		try {
			const { _id } = req.user;
			const productId = req.params.id;
			const data = await service.RemoveFromWishlist(_id, productId);
			return res.status(200).json(data);
		} catch (error) {
			next(error);
		}
	});

	// Cart
	app.get('/cart', UserAuth, async (req, res, next) => {
		const { _id } = req.user;
		try {
			const { data } = await service.GetCart(_id);
			return res.status(200).json(data);
		} catch (err) {
			next(err);
		}
	});

	app.post('/cart', UserAuth, async (req, res, next) => {
		const { _id } = req.user;
		try {
			const { data } = await service.AddCartItem(
				_id,
				req.body._id,
				req.body.qty
			);
			return res.status(200).json(data);
		} catch (err) {
			next(err);
		}
	});

	app.delete('/cart/:id', UserAuth, async (req, res, next) => {
		const { _id } = req.user;
		const productId = req.params.id;
		try {
			const { data } = await service.RemoveCartItem(_id, productId);
			return res.status(200).json(data);
		} catch (err) {
			next(err);
		}
	});
};
