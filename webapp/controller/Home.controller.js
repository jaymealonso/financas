sap.ui.define([
	"./Base",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function(BaseController, formatter, JSONModel, Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Home", {

		formatter: formatter,

		onInit: function () {

			this.getRouter().getTarget("home").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			const { join } = nodeRequire("path");
			const { remote } = nodeRequire("electron");
			this.webs = remote.require(join(__dirname, "..", "electron", "web_services.js"));
			this.webs.connect();

		},

		handleRouteMatched: function (oEvt) {

			this._loadContas( );
			this._loadTipoConta( );

		},

		_loadContas: function () {
			var oView = this.getView();
			oView.setModel(new JSONModel([{}]), "contas", );

			this.webs.getContas((rows) => {
				oView.setModel(new JSONModel(rows), "contas", )
			});

			// $.ajax("/contas", {
			// 	success: function (values) {
			// 		oView.setModel(new JSONModel(values), "contas", );
			// 	}
			// });
		},

		_loadTipoConta: function () {
			var oView = this.getView();
			oView.setModel(new JSONModel([{}]), "contas_tipos", );

			this.webs.getContasTipos((rows) => {
				oView.setModel(new JSONModel(rows), "contas_tipos", )
			});

			// $.ajax("/contas_tipos", {
			// 	success: function (values) {
			// 		oView.setModel(new JSONModel(values), "contas_tipos", );
			// 	}
			// });
		},

		onItemPressNavigate: function (oEvt) { 

			var oModel = this.getView().getModel("contas");
			var sPath = oEvt.getParameter("listItem").getBindingContextPath();
			var sIdConta = oModel.getProperty(sPath + '/_id');
			this.getRouter().navTo("cnt_lancamentos", { "cnt": sIdConta } );

		},

		onContaLancamentosPress: function (oEvt) { 

			var oModel = this.getView().getModel("contas");
			var oTableLine = oEvt.getSource().getParent();
			var sPath = oTableLine.getBindingContextPath();
			var sIdConta = oModel.getProperty(sPath + '/_id');
			this.getRouter().navTo("cnt_lancamentos", { "cnt": sIdConta } );

		},

		onContaEditPress: function (oEvt) {
			var oListItem = oEvt.getSource().getParent();
			var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				name: "sap.ui.demo.basicTemplate.view.Conta-edit",
				controller: this
			}).then(function (oContasEdit) {
				var aCellsRemoved = oListItem.removeAllCells();
				for ( var iIndex in aCellsRemoved ) {
					aCellsRemoved[iIndex].destroy();
				};
				oListItem.addDependent(oContasEdit);
				oContasEdit.getCells().forEach(function (i) {
					oListItem.addCell(i);
				});
			});
		},

		onContaEditAcceptPress: function (oEvt) {
			var that = this;
			var oListItem = oEvt.getSource().getParent();
			var oView = this.getView();
			var oModel = this.getView().getModel("contas");
			var sPath = oListItem.getBindingContextPath();
			var oObject = oModel.getProperty(sPath);

			new Promise(function (fnApprove, fnReject) {

				that.webs.changeConta(oObject, (rows) => {
					try {
						oObject = rows;
						oModel.setProperty(sPath, oObject);
						fnApprove();
					} catch (err) {
						fnReject(err);
					}
				});

				// $.ajax("/conta/" + oObject._id, {
				// 	method: "POST",
				// 	data: oObject,
				// 	success: function (values) {
				// 		oObject = values; // values.data = new Date(values.data);
				// 		oModel.setProperty(sPath, oObject);
				// 		fnApprove();
				// 	},
				// 	error: function (err) {
				// 		fnReject(err);
				// 	}
				// });
			}).then(function () {
				Fragment.load({
					id: oView.getId(),
					name: "sap.ui.demo.basicTemplate.view.Conta-display",
					controller: that
				}).then(function (oContasEdit) {
					var aCellsRemoved = oListItem.removeAllCells();
					for ( var iIndex in aCellsRemoved ) {
						aCellsRemoved[iIndex].destroy();
					};
					oListItem.addDependent(oContasEdit);
					oContasEdit.getCells().forEach(function (i) {
						oListItem.addCell(i);
					});
				});
			});

		},

		onContaEditRejectPress: function (oEvt) {
			var oListItem = oEvt.getSource().getParent();
			var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				name: "sap.ui.demo.basicTemplate.view.Conta-display",
				controller: this
			}).then(function (oContasEdit) {
				var aCellsRemoved = oListItem.removeAllCells();
				for ( var iIndex in aCellsRemoved ) {
					aCellsRemoved[iIndex].destroy();
				};
				oListItem.addDependent(oContasEdit);
				oContasEdit.getCells().forEach(function (i) {
					oListItem.addCell(i);
				});
			});
		},

		onContaVisaoMensalPress: function (oEvt) {
			var oModel = this.getView().getModel("contas");
			var oTableLine = oEvt.getSource().getParent();
			var sPath = oTableLine.getBindingContextPath();
			var sIdConta = oModel.getProperty(sPath + '/_id');
			this.getRouter().navTo("visao_mensal", { "cnt": sIdConta } );
		}



	});
});