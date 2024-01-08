const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const WishlistSchema = new Schema(
	{
		customerId: String,
		products: [
			{
				_id: { type: String, require: true },
			},
		],
	},
	{
		toJSON: {
			transform(doc, ret) {
				delete ret.__v;
			},
		},
		timestamps: true,
	}
);

module.exports = mongoose.model('wishlist', WishlistSchema);
