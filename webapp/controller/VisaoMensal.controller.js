sap.ui.define([
	"./Base",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function(BaseController, formatter, JSONModel, Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.VisaoMensal", {

        onInit: function () {
			this.getRouter().getTarget("visao_mensal").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},
		
		sContaId: null, 

		handleRouteMatched: function  (oEvt) {

            this.sContaId = oEvt.getParameter("data").cnt;

            this._loadData( );

        },

        _loadData: function (oEvt) {
			var oView = this.getView();
			oView.setModel(new JSONModel([{}]), "visao_geral");
			$.ajax("/conta/" + this.sContaId + "/visao_mensal", {
				success: function (values) {
					oView.setModel(new JSONModel(values), "visao_geral");
				}
			});
        },

        onBackPress: function () {
			const electron = nodeRequire("electron");
			const ipc = electron.ipcRenderer;
			ipc.send("go-back-button");
        },
        
        onColFactory: function (sId, oContext) {
            var oObject = oContext.getObject();

			var oCell;
			var oCol;

			if (oObject.column_name === "nm_categoria") {
				oCell = new sap.m.Text();
				oCell.bindText({ path: `visao_geral>${oObject.column_name}` });
				oCol = new sap.ui.table.Column({
					label: oObject.ano_mes,
					template:  oCell
				});
			} else {
				oCell = new sap.m.ObjectNumber({
					textAlign: "End"
				});
				oCell.bindProperty("number", {
					parts: [{path: `visao_geral>${oObject.column_name}`},{path: `visao_geral>moeda`}], 
					type: 'sap.ui.model.type.Currency',
					formatOptions: {
						minFractionDigits: 2,
						showMeasure: false
					}
				});
				oCell.bindProperty("state", {
					path: `visao_geral>${oObject.column_name}`,
					formatter: this._valueStateFormatter
				});

				var oButtonLancDetalhes = new sap.m.Button({
					icon: "sap-icon://show-edit",
					type: "Transparent",
					press: this.onBtnLancDetalhesPress.bind(this)
				});
				oButtonLancDetalhes.bindProperty("visible", {
					path: `visao_geral>${oObject.column_name}`,
					formatter: this._btnVisFormatter,
				});

				var oHBox = new sap.m.HBox({
					justifyContent: "End",
					alignItems: "Center",
					items: [ oCell, oButtonLancDetalhes ]
				});

				oCol = new sap.ui.table.Column({
					label: oObject.ano_mes,
					template:  oHBox //oCell
				});
			}

            return oCol;
		},
		
		_btnVisFormatter: function (nValue) {
			return nValue ? true: false;
		},

		_valueStateFormatter: function (nValue) { 
			return nValue < 0 ? 'Error' : 'Success';
		},

		onBtnLancDetalhesPress: function (oEvt) {
			
			var oNumber = oEvt.getSource().getParent().getItems()[0];
			var oRow = oEvt.getSource().getParent().getParent();
			var oModel = oEvt.getSource().getModel("visao_geral");

			// Binding da 1a coluna
			var oBinding = oRow.getCells()[0].getBindingInfo("text").binding;
			var sPath =  `${oBinding.oContext.getPath()}/categoria_id`;

			var sCategID = oModel.getProperty(sPath);
			var sAnoMes = oNumber.getBindingInfo("number").parts[0].path;

			var sValues = `ano_mes=${sAnoMes}`
			if (sCategID) {
				sValues = `${sValues}&categoria_id=${sCategID}`;
			}

			var sURL = `/conta/${this.sContaId}/lancamentos?${sValues}`;

			var that = this;

			$.ajax(sURL, {
				success: function (values) {
					var oView = that.getView();
					oView.setModel(new JSONModel(values), "vg_lanc_pop");
					Fragment.load({
						name: "sap.ui.demo.basicTemplate.view.VisaoMensal-LancPop",
						controller: that
					}).then(function (oDialog) {
						oView.addDependent(oDialog);
						oDialog.open();
					})

				}
			});
		},
		onLancPopFecharPress: function (oEvt) {
			oEvt.getSource().getParent().close();
		}

	});
});