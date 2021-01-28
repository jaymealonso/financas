sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/demo/basicTemplate/model/formatter"
], function(Controller, formatter) {
	"use strict";

	return Controller.extend("sap.ui.demo.basicTemplate.controller.Base", {

		formatter: formatter,

		onInit: function () {

		},

		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter : function () {
			return this.getOwnerComponent().getRouter();
		}
				
	});
});