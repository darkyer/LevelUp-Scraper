var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var DataSchema = new Schema({
	// `string` must be of type String. We "trim" it to remove any trailing white space
	// `string` is a required field, and a custom error message is thrown if it is not supplied
	title: {
		type: String,
		trim: true,
		required: "String is Required"
    },
    
    link: {
		type: String,
		trim: true,
		required: "String is Required"
	},

	imagelink: {
		type: String,
		trim: true,
		required: "String is Required"
	},


	comments: Array
});

var Data = mongoose.model("Data", DataSchema);


module.exports = Data;