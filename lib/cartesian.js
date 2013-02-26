// Generate all combinations of key options
//   {x:[1, 2], y:[3, 4]} 
// ->
//   [{x: 1, y:3}, {x:1, y:4}, {x:2, y:3}, {x:2,y:4}]
//
// Currently: this doesn't work
//

var _ = require('underscore');

function cartesianProduct(val) {
	var out = [];

	_.each(val, function(val, key) {
		// uhm..
	});

	return out;
}
module.exports = cartesianProduct;
