const { ShoppingRepository } = require('../database');
const { FormateData, RPCRequest } = require('../utils');
const { APIError } = require('../utils/errors/app-errors');

// All Business logic will be here
class ShoppingService {
	constructor() {
		this.repository = new ShoppingRepository();
	}

	// Cart
	async GetCart(_id) {
		try {
			const cartItems = await this.repository.Cart(_id);
			if (!cartItems) return {};
			return cartItems;
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

	// Wishlist
	async AddToWishlist(customerId, productId) {
		return this.repository.ManageWishlist(customerId, productId, false);
	}

	async RemoveFromWishlist(customerId, productId) {
		return this.repository.ManageWishlist(customerId, productId, true);
	}

	async GetWishlist(customerId) {
		// RPC call to get product detail
		const data = await this.repository.GetWishlistByCustomerId(customerId);
		if (!data) return {};
		const { products } = data;
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
	async CreateOrder(customerId, txnNumber) {
		try {
			return this.repository.CreateNewOrder(customerId, txnNumber);
		} catch (err) {
			throw new APIError('Data Not found', err);
		}
	}

	async GetOrder(orderId) {
		return await this.repository.Orders(null, orderId);
	}

	async GetOrders(customerId) {
		return await this.repository.Orders(customerId, null);
	}

	async DeleteProfileData(customerId) {
		return this.repository.DeleteProfileData(customerId);
	}

	async SubscribeEvents(payload) {
		const { event, data } = payload;
		console.log(payload);
		switch (event) {
			case 'DELETE_PROFILE':
				await this.DeleteProfileData(data.userId);
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
