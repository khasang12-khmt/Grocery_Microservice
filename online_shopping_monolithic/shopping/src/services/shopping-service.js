const { ShoppingRepository } = require('../database');
const { FormateData, RPCRequest } = require('../utils');

// All Business logic will be here
class ShoppingService {
	constructor() {
		this.repository = new ShoppingRepository();
	}

	// Cart
	async GetCart(_id) {
		try {
			const cartItems = await this.repository.Cart(_id);
			return FormateData(cartItems);
		} catch (err) {
			throw err;
		}
	}

	async AddCartItem(customerId, productId, qty) {
		// Get product info from ProductService via RPC
		const productResponse = await RPCRequest('PRODUCT_RPC', {
			type: 'VIEW_PRODUCT',
			data: productId,
		});
		if (productResponse && productResponse._id) {
			const data = await this.repository.ManageCart(
				customerId,
				productResponse,
				qty
			);
			return data;
		}
		throw new Error('Product not found');
	}

	async RemoveCartItem(customerId, productId) {
		return FormateData(
			this.repository.ManageCart(customerId, { _id: productId }, 0, true)
		);
	}

	// Wishlist
	async AddToWishlist(customerId, productId) {
		return this.repository.ManageWishlist(customerId, productId, false);
	}

	async RemoveFromWishlist(customerId, productId) {
		return this.repository.ManageWishlist(customerId, productId, true);
	}

	async GetWishlist(customerId) {
		// RPC call to get product detail
		const { products } = await this.repository.GetWishlistByCustomerId(
			customerId
		);
		if (Array.isArray(products)) {
			const ids = products.map(({ _id }) => _id);
			const productResponse = await RPCRequest('PRODUCT_RPC', {
				type: 'VIEW_PRODUCTS',
				data: ids,
			});
			if (productResponse) {
				return productResponse;
			}
		}
		return {};
	}

	// Order
	async PlaceOrder(userInput) {
		const { _id, txnNumber } = userInput;

		// Verify the txn number with payment logs

		try {
			const orderResult = await this.repository.CreateNewOrder(
				_id,
				txnNumber
			);
			return FormateData(orderResult);
		} catch (err) {
			throw new APIError('Data Not found', err);
		}
	}

	async GetOrders(customerId) {
		try {
			const orders = await this.repository.Orders(customerId);
			return FormateData(orders);
		} catch (err) {
			throw new APIError('Data Not found', err);
		}
	}

	async ManageCart(customerId, item, qty, isRemove) {
		try {
			const cartResult = await this.repository.AddCartItem(
				customerId,
				item,
				qty,
				isRemove
			);
			return FormateData(cartResult);
		} catch (err) {
			throw err;
		}
	}

	async SubscribeEvents(payload) {
		const { event, data } = payload;

		const { userId, product, order, qty } = data;
		console.log(event);
		switch (event) {
			case 'ADD_TO_CART':
				this.ManageCart(userId, product, qty, false);
				break;
			case 'REMOVE_FROM_CART':
				this.ManageCart(userId, product, qty, true);
				break;
			case 'TEST':
				console.log('Works');
				break;
			default:
				break;
		}
	}

	async GetOrderPayload(userId, order, event) {
		if (order) {
			const payload = {
				event: event,
				data: { userId, order },
			};
			return FormateData(payload);
		} else {
			return FormateData({ error: 'No Order available' });
		}
	}
}

module.exports = ShoppingService;
