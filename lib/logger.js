/**
 * simple logger wrapper using console
 */

'use strict';

var levels = ['debug', 'info', 'warn', 'error'];

var logger = {
	logLevel: 'info',

	debug: function () {
		if (this._compareLevel('debug')) {
			console.log.apply(this, arguments);
		}
	},

	info: function () {
		if (this._compareLevel('info')) {
			console.info.apply(this, arguments);
		}
	},

	warn: function () {
		if (this._compareLevel('warn')) {
			console.warn.apply(this, arguments);
		}
	},

	error: function (message) {
		if (this._compareLevel('error')) {
			console.error.apply(this, arguments);
		}
	},

	_compareLevel: function (level) {
		return levels.indexOf(level) >= levels.indexOf(this.logLevel);
	}
};

module.exports = logger;
