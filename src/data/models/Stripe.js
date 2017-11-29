var config = require('../../config');
var stripe = require("stripe")(
  config.auth.stripe.secret
);

