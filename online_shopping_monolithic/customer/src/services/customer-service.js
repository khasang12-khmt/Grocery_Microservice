const { CustomerRepository } = require('../database');
const {
	FormateData,
	GeneratePassword,
	GenerateSalt,
	GenerateSignature,
	ValidatePassword,
} = require('../utils');
const {
	APIError,
	NotFoundError,
	ValidationError,
} = require('../utils/errors/app-errors');

// All Business logic will be here
class CustomerService {
	constructor() {
		this.repository = new CustomerRepository();
	}

	async SignIn(userInputs) {
		const { email, password } = userInputs;

		const existingCustomer = await this.repository.FindCustomer({
			email,
		});
		if (!existingCustomer) throw new NotFoundError('user not found');

		const validPassword = await ValidatePassword(
			password,
			existingCustomer.password,
			existingCustomer.salt
		);
		if (!validPassword) throw new ValidationError('password not valid');

		const token = await GenerateSignature({
			email: existingCustomer.email,
			_id: existingCustomer._id,
		});
		return FormateData({ id: existingCustomer._id, token });
	}

	async SignUp(userInputs) {
		const { email, password, phone } = userInputs;

		let salt = await GenerateSalt();

		let userPassword = await GeneratePassword(password, salt);

		const existingCustomer = await this.repository.CreateCustomer({
			email,
			password: userPassword,
			phone,
			salt,
		});

		const token = await GenerateSignature({
			email: email,
			_id: existingCustomer._id,
		});

		return FormateData({ id: existingCustomer._id, token });
	}

	async AddNewAddress(_id, userInputs) {
		const { street, postalCode, city, country } = userInputs;
		return this.repository.CreateAddress({
			_id,
			street,
			postalCode,
			city,
			country,
		});
	}

	async GetProfile(id) {
		const existingCustomer = await this.repository.FindCustomerById({
			id,
		});
		if (!existingCustomer) throw new NotFoundError('user not found');
		return existingCustomer;
	}

	async DeleteProfile(id) {
		const data = await this.repository.DeleteCustomerById(id);
		const payload = {
			event: 'DELETE_PROFILE',
			data: { userId: id._id },
		};
		return { data, payload };
	}
}

module.exports = CustomerService;
