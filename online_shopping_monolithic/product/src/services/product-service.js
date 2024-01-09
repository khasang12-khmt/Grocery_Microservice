const { ProductRepository } = require('../database');
const { FormateData } = require('../utils');
const { APIError } = require('../utils/errors/app-errors');

// All Business logic will be here
class ProductService {
	constructor() {
		this.repository = new ProductRepository();
	}

	async CreateProduct(productInputs) {
		const productResult = await this.repository.CreateProduct(
			productInputs
		);
		return FormateData(productResult);
	}

	async GetProducts() {
		const products = await this.repository.Products();

		let categories = {};

		products.map(({ type }) => {
			categories[type] = type;
		});

		return FormateData({
			products,
			categories: Object.keys(categories),
		});
	}

	async GetProductDescription(productId) {
		const product = await this.repository.FindById(productId);
		return FormateData(product);
	}

	async GetProductsByCategory(category) {
		const products = await this.repository.FindByCategory(category);
		return FormateData(products);
	}

	async GetSelectedProducts(selectedIds) {
		const products = await this.repository.FindSelectedProducts(
			selectedIds
		);
		return FormateData(products);
	}

	async GetProductById(productId) {
		return await this.repository.FindById(productId);
	}

	async serveRPCRequest(payload) {
		const { type, data } = payload;
		switch (type) {
			case 'VIEW_PRODUCT':
				return this.repository.FindById(data);
			case 'VIEW_PRODUCTS':
				return this.repository.FindSelectedProducts(data);
			default:
				break;
		}
	}
}

module.exports = ProductService;
