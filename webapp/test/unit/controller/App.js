/*global QUnit*/

sap.ui.define([
	"sap/ui/demo/basicTemplate/controller/Home.controller"
], function(oController) {
	"use strict";

	QUnit.module("App Controller");

	QUnit.test("I should test the controller", function (assert) {
		// eslint-disable-next-line new-cap
		var oAppController = new oController();

		oAppController.onInit();
		assert.ok(oAppController);
	});

});
