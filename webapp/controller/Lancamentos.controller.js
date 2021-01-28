sap.ui.define([
	"./Base",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function(BaseController, formatter, JSONModel, Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Lancamentos", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getTarget("cnt_lancamentos").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
		},

		sContaId: null,

		handleRouteMatched: function  (oEvt) {

			this.sContaId = oEvt.getParameter("data").cnt;

			var oView = this.getView();
			oView.setModel(new JSONModel({
				"ColumnType": "Active",
				"TableLancamentosMode" : "None",
				"PageTitle": "",
				"TableLancamentosTitle" : ""
			}), "conf");

			oView.setModel(new JSONModel([{
				"_id": "A",
				"nm_categoria" : "Tabela"
			}]), "sugg");

			this._readConta( );
			this._loadLancamentos( );
			this._loadCategorias( );

		},

		_readConta: function () {
			var oView = this.getView();
			var oModelCnf = oView.getModel("conf");
			var oBundle = oView.getModel("i18n").getResourceBundle();			
			oView.setModel(new JSONModel([{}]), "categorias");
			$.ajax("/conta/" + this.sContaId, {
				success: function (values) {
					oView.setModel(new JSONModel(values), "conta");
					var sPTitle = oBundle.getText("title-cnt_lanc", [values._id, values.descricao]);
					oModelCnf.setProperty("/PageTitle", sPTitle);
				}
			});
		},			

		_loadCategorias: function () {
			var oView = this.getView();
			oView.setModel(new JSONModel([{}]), "categorias");
			$.ajax("/categorias", {
				success: function (values) {
					oView.setModel(new JSONModel(values), "categorias");		
				}
			});
		},

		_loadLancamentos: function ( ) {
			var oView = this.getView();
			var oModelCnf = oView.getModel("conf");
			var oBundle = oView.getModel("i18n").getResourceBundle();			
			oView.setModel(new JSONModel({}), "lancamentos");
			$.ajax("/conta/" + this.sContaId + "/lancamentos", {
				success: function (values) {
					for (var i in values) {
						values[i].data = new Date(values[i].data);
					}
					oView.setModel(new JSONModel(values), "lancamentos");
					var sTitle = oBundle.getText("title-lanc", [values.length]);
					oModelCnf.setProperty("/TableLancamentosTitle", sTitle);
				}
			});
		},

		onBackPress: function () {
			const electron = nodeRequire("electron");
			const ipc = electron.ipcRenderer;
			ipc.send("go-back-button");
		},

		onLancUpFilePress: function (oEvt) {
			window.open(`.#/conta/${this.sContaId}/lancamentos/importar`);

			//this.getRouter().navTo("importar_arquivo", { "cnt": this.sContaId } );
		},

		onNewLancamento: function (oEvt) {
			var that = this;
			var sURL = "/conta/" + this.sContaId + "/lancamentos";
			$.post(sURL, 
				{
					conta_id: that.sContaId,
					nr_referencia: '***',
					descricao: 'New Item',
					data: new Date().toISOString().substr(0,10),
					valor: 0
				},
				function (response) {
					that._loadLancamentos( );
				}
			);
		},

		onEliminarTogglePress: function (oEvt) {
			var oView = this.getView();
			var oModel = oView.getModel("conf");
			if (oModel.getProperty("/TableLancamentosMode") === "None") { 
				oModel.setProperty("/TableLancamentosMode", "Delete");
			} else {
				oModel.setProperty("/TableLancamentosMode", "None");
			}
		},

		onTableLancDelete: function (oEvt) {
			var that = this;
			var oListItm = oEvt.getParameter("listItem");
			var oModel = this.getView().getModel("lancamentos");
			var sPath = oListItm.getBindingContextPath();
			var oObject = oModel.getProperty(sPath);
			var sURL = "/conta/" + oObject.conta_id + "/lancamento/" + oObject._id;
			$.ajax(sURL, {
				method: "DELETE",
				success: function () {
					oListItm.destroy();
				}
			});
		},

		onLancAtualizPress: function () {
			this._loadLancamentos( );
		},

		onLancItemPress: function (oEvt) {
			var that = this;
			var oListItem = oEvt.getParameter("listItem");
			var oView = this.getView();
			var oModel = oView.getModel("conf");
			Fragment.load({
				id: oView.getId(),
				name: "sap.ui.demo.basicTemplate.view.Lancamento-edit",
				controller: that
			}).then(function (oLancEdit) {
				// - teste descomentar - 
				// oModel.setProperty("/ColumnType", "Inactive");
				// oModel.setProperty("/TableLancamentosMode", "None");

				that._replaceListItem(oListItem, oLancEdit);
			});
		},

		onAcceptChanges: function (oEvt) {
			// hieraquia reversa: botão (source) > list-item
			var that = this;
			var oListItem = oEvt.getSource().getParent();
			var oView = this.getView();
			var oModelLnc = oView.getModel("lancamentos");
			var oModel = oView.getModel("conf");
			var sPath = oListItem.getBindingContextPath();
			// Copia dados para um objeto isolado.
			var oObject = jQuery.extend({}, oModelLnc.getProperty(sPath) );
			oObject.data = oObject.data.toISOString().substr(0,10);

			new Promise(function (fnApprove, fnReject) {
				$.ajax("/conta/" + oObject.conta_id + "/lancamento/" + oObject._id, {
					method: "POST",
					data: oObject,
					success: function (values) {
						values.data = new Date(values.data);
						oModelLnc.setProperty(sPath, values);
						fnApprove();
					},
					error: function (err) {
						fnReject(err);
					}
				});
			}).then(function () {

				Fragment.load({
					name: "sap.ui.demo.basicTemplate.view.Lancamento-display",
					controller: that
				}).then(function (oLancDisplay) {
					oModel.setProperty("/ColumnType", "Active");
	
					that._replaceListItem(oListItem, oLancDisplay);
				});		

			});
		},

		onRejectChanges: function (oEvt) {
			// hieraquia reversa: botão (source) > list-item
			var that = this;
			var oListItem = oEvt.getSource().getParent();
			var oView = this.getView();
			var oModel = oView.getModel("conf");
			Fragment.load({
				name: "sap.ui.demo.basicTemplate.view.Lancamento-display",
				controller: that
			}).then(function (oLancDisplay) {
				oModel.setProperty("/ColumnType", "Active");

				that._replaceListItem(oListItem, oLancDisplay);
			});		
		},

		_replaceListItem(oListItRemove, oListItAdd) {
			var aCellsRemoved = oListItRemove.removeAllCells();
			for ( var iIndex in aCellsRemoved ) {
				aCellsRemoved[iIndex].destroy();
			};
			oListItRemove.addDependent(oListItAdd);
			oListItAdd.getCells().forEach(function (i) {
				oListItRemove.addCell(i);
			});
		},

		onCmbCategSelChange: function (oEvt) {
			var oCmb = oEvt.getSource();
			var oListItem = oCmb.getParent();
			var oView = this.getView();
			var oModelLnc = oView.getModel("lancamentos");
			var sPath = oListItem.getBindingContextPath();
			var oObject = oModelLnc.getProperty(sPath);
			oObject.data = oObject.data.toISOString().substr(0,10);

			$.ajax("/conta/" + oObject.conta_id + "/lancamento/" + oObject._id, {
				method: "POST",
				data: oObject,
				success: function (values) {
					values.data = new Date(values.data);
					oModelLnc.setProperty(sPath, values);
					// fnApprove();
				},
				error: function (err) {
					// fnReject(err);
				}
			});
		},

		onCategoriasPress: function (oEvt) {
			var oView = this.getView();
			Fragment.load({
				id: oView.getId(),
				name: "sap.ui.demo.basicTemplate.view.Categorias",
				controller: this
			}).then(function (oDialog) {
				oView.addDependent(oDialog);
				oDialog.open();
			});
		},
		
		onAddCategoriaPress: function (oEvt) {
			var that = this;
			var oHbox = oEvt.getSource().getParent();
			var oInput = oHbox.getItems().find( i => i.getMetadata().getName() === "sap.m.Input" );
			var oObject = { nm_categoria: oInput.getValue( ) };
			$.ajax("/categorias", {
				method: "POST",
				data: oObject,
				success: function (values) {
					that._loadCategorias( );
				},
				error: function (err) {
					// fnReject(err);
				}
			});
		},

		onCategoriasFecharPress: function (oEvt) {
			oEvt.getSource().getParent().close();
		}

	});
});