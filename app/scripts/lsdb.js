define(

	[

	],

	function (){

		"use strict";

		var Fn = function (){};
		/*global console */
		var proto = {

			data: {},

			init: function () {
				this.preload();
				return this;
			},

			getLastKey: function (){
				return this.all().length + 1;
			},

			get: function (key) {
				return JSON.parse(window.localStorage.getItem(key));
			},

			getById: function(id) {
				return window.localStorage[id];
			},

			save: function (key, value){
				var _t = window.localStorage.getItem(key);
				window.localStorage.setItem(key, JSON.stringify(value));

			},

			preload: function () {
				var keys = Object.keys(window.localStorage);
				for (var key in keys) {
					this.data[key] = this.get(key);
				}
			},
			all: function () {
				return Object.keys(window.localStorage);
			},
			_db : window.localStorage
		};

		Fn.prototype = proto;
		var db = new Fn();
		db.init();
		return db;
});