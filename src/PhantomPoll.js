var phantom = require('phantom');

/**
 * @constructor
 */
var PhantomPoll = function() {
	this.instance = null;
	this.creating = false;
	this.flags = '';
	this.options = {
		onStdout: function() {},
		onStderr: function() {}
	};
	this.waiting = [];
	this._createInstance();
};
PhantomPoll.prototype = {
	constructor: PhantomPoll,
	createPage: function(callback) {
		if (this.instance) {
			this.instance.createPage(function(page) {
				callback(page);
			});
		} else {
			var that = this;
			this._createInstance(function() {
				that.createPage(callback);
			});
		}
	},
	create: function(flags, options, callback) {
		this.flags = flags;
		this.options = options;
		callback(this);
	},
	_createInstance: function(callback) {
		if (this.creating && callback) {
			this.waiting.push(callback);
		} else {
			var that = this;
			this.creating = true;
			phantom.create(this.flags, this.options, function(ph) {
				that.instance = ph;
				that.creating = false;
				that.waiting.forEach(function(callback) {
					callback(ph);
				});
				that.waiting = [];
			});
		}
	},
	exit: function() {},
	close: function() {
		if (this.instance) {
			this.instance.exit();
		}
	}
};

module.exports = PhantomPoll;