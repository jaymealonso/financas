sap.ui.define([
	"./Base",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(BaseController, formatter, JSONModel, Fragment, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.Lancamentos", {

		formatter: formatter,

		onInit: function () {
			this.getRouter().getTarget("cnt_lancamentos").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			const { join } = nodeRequire("path");
			const { remote } = nodeRequire("electron");
			this.webs = remote.require(join(__dirname, "..", "electron", "web_services.js"));
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

			this.webs.readConta(
				this.sContaId,
				(values) => {
					oView.setModel(new JSONModel(values), "conta");
					var sPTitle = oBundle.getText("title-cnt_lanc", [values._id, values.descricao]);
					oModelCnf.setProperty("/PageTitle", sPTitle);
				}
			);

			// $.ajax("/conta/" + this.sContaId, {
			// 	success: function (values) {
			// 		oView.setModel(new JSONModel(values), "conta");
			// 		var sPTitle = oBundle.getText("title-cnt_lanc", [values._id, values.descricao]);
			// 		oModelCnf.setProperty("/PageTitle", sPTitle);
			// 	}
			// });
		},			

		_loadCategorias: function () {
			var oView = this.getView();
			oView.setModel(new JSONModel([{}]), "categorias");

			this.webs.getCategorias(
				(values) => oView.setModel(new JSONModel(values), "categorias")
			);
		},

		_loadLancamentos: function ( ) {
			var oView = this.getView();
			var oModelCnf = oView.getModel("conf");
			var oBundle = oView.getModel("i18n").getResourceBundle();			
			oView.setModel(new JSONModel({}), "lancamentos");
			
			const oTable = oView.byId("tblLancamentos");

			oTable.setBusyIndicatorDelay(0);
			oTable.setBusy(true);

			
			return new Promise((approve, reject) => {
				this.webs.getLancamentos(
					// eslint-disable-next-line camelcase
					{ conta_id: this.sContaId },
					undefined,
					(values) => {
						oView.setModel(new JSONModel(values), "lancamentos");
						var sTitle = oBundle.getText("title-lanc", [values.length]);
						oModelCnf.setProperty("/TableLancamentosTitle", sTitle);
						approve();
					}
				);
			}).finally(() => 
				oTable.setBusy(false)
			);
		},

		// onLancUpdateStarted: function (oEvt, a, b) {

		// 	const oModel = this.getView().getModel("lancamentos");
		// 	var aData = oModel.getData();
		// 	var emptyObj = {};
		// 	aData = JSON.stringify(emptyObj) === JSON.stringify(aData) ? new Array(0) : aData;

		// 	return new Promise((approve, reject) => {
		// 		this.webs.getLancamentos(
		// 			// eslint-disable-next-line camelcase
		// 			{ conta_id: this.sContaId },
		// 			{ limit: 10, offset: aData.length },
		// 			(values) => {
		// 				aData.push(values);
		// 				if (!aData) reject();
		// 				oModel.setData(aData);
		// 				var sTitle = oBundle.getText("title-lanc", [values.length]);
		// 				oModelCnf.setProperty("/TableLancamentosTitle", sTitle);
		// 				approve();
		// 			}
		// 		)
		// 	});

		// 	MessageToast.show("Update Started.");
		// },

		onBackPress: function () {
			const electron = nodeRequire("electron");
			const ipc = electron.ipcRenderer;
			ipc.send("go-back-button");
		},

		onLancUpFilePress: function (oEvt) {
			// window.open(`.#/conta/${this.sContaId}/lancamentos/importar`);

			this.getRouter().navTo("importar_arquivo", { "cnt": this.sContaId } );
		},

		onNewLancamento: function (oEvt) {
			var that = this;
			// var sURL = "/conta/" + this.sContaId + "/lancamentos";
			var oObject = {
				// eslint-disable-next-line camelcase
				conta_id: that.sContaId,
				// eslint-disable-next-line camelcase
				nr_referencia: '***',
				descricao: 'New Item',
				data: new Date().toISOString().substr(0,10),
				valor: 0
			};
			this.webs.newLancamento(oObject, () => that._loadLancamentos( ));

			// $.post(sURL, 
			// 	{
			// 		conta_id: that.sContaId,
			// 		nr_referencia: '***',
			// 		descricao: 'New Item',
			// 		data: new Date().toISOString().substr(0,10),
			// 		valor: 0
			// 	},
			// 	function (response) {
			// 		that._loadLancamentos( );
			// 	}
			// );
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
			// var that = this;
			var oListItm = oEvt.getParameter("listItem");
			var oModel = this.getView().getModel("lancamentos");
			var sPath = oListItm.getBindingContextPath();
			var oObject = oModel.getProperty(sPath);
		
			this.webs.deleteLancamento(oObject.conta_id, oObject._id, 
				() => oListItm.destroy()
			);

			// var sURL = "/conta/" + oObject.conta_id + "/lancamento/" + oObject._id;
			// $.ajax(sURL, {
			// 	method: "DELETE",
			// 	success: function () {
			// 		oListItm.destroy();
			// 	}
			// });
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
			}).then((oLancEdit) => {
				oModel.setProperty("/ColumnType", "Inactive");
				oModel.setProperty("/TableLancamentosMode", "None");

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
				that.webs.changeLancamento(oObject, 
					(values) => {
						values.data = new Date(values.data);
						oModelLnc.setProperty(sPath, values);
						fnApprove();
					}
				);
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

		onCmbCategChange: function (oEvt) {
			var oCmb = oEvt.getSource();
			var oListItem = oCmb.getParent();
			var oView = this.getView();
			var oModelLnc = oView.getModel("lancamentos");
			var sPath = oListItem.getBindingContextPath();
			var oObject = oModelLnc.getProperty(sPath);
			oObject.data = oObject.data.toISOString().substr(0,10);

			this.webs.changeLancamento(oObject, 
				(values) => {
					values.data = new Date(values.data);
					oModelLnc.setProperty(sPath, values);
					// fnApprove();
				}
			);			

			// $.ajax("/conta/" + oObject.conta_id + "/lancamento/" + oObject._id, {
			// 	method: "POST",
			// 	data: oObject,
			// 	success: function (values) {
			// 		values.data = new Date(values.data);
			// 		oModelLnc.setProperty(sPath, values);
			// 		// fnApprove();
			// 	},
			// 	error: function (err) {
			// 		// fnReject(err);
			// 	}
			// });
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
			// eslint-disable-next-line camelcase
			var oObject = { nm_categoria: oInput.getValue( ) };

			that.webs.newCategoria(oObject)
				.then(() => {
					oInput.setValue("");
					that._loadCategorias( );
				})
				.catch( (err) => 
					MessageBox.error(err.message, { styleClass: 'sapUiSizeCompact' } )
				);
		},

		onCategoriasFecharPress: function (oEvt) {
			oEvt.getSource().getParent().close();
		},

		_loadAnexos: async function (idLancamento) {
			var oRows = await this.webs.getAnexoFiles(idLancamento);
			this.getView().setModel(new JSONModel(oRows), "anexos");			
		},

		onButtonAnexoPress: async function (oEvt) {
			var oButton = oEvt.getSource();
			var sPath = oButton.getParent().getBindingContextPath();
			var oView = this.getView();

			this.oLancamento = oView.getModel("lancamentos").getProperty(sPath);

			await this._loadAnexos(this.oLancamento._id);
			Fragment.load({
				// id: oView.getId(),
				name: "sap.ui.demo.basicTemplate.view.Lancamento-anexos",
				controller: this
			}).then(function (oPopover) {
				oView.addDependent(oPopover);
				oPopover.attachAfterClose(() => oPopover.destroy());
				oPopover.openBy(oButton);
			});
		},

		onUploadAnexo: function (oEvt) {
			if (!this.oLancamento) return;

			var that = this;
			this.webs.uploadAnexoFile(this.oLancamento._id, this.oLancamento.data.toISOString())
				.then((oValores) => that._loadAnexos(oValores.lancamento_id) )
				.catch( (err) => 
					MessageBox.error(err, { styleClass: 'sapUiSizeCompact' } )
				);
			},

		onOpenFolder: function (oEvt) {
			this.webs.openFolder(this.oLancamento.data.toISOString());
		},
		
		onTableCategDelete: function (oEvt) {
			var oListItem = oEvt.getParameter("listItem");
			var oList = oListItem.getParent();
			oList.setBusy(true);
			var sPath = oListItem.getBindingContextPath()
			var oModel = this.getView().getModel("categorias");
			var oCategoria = oModel.getProperty(sPath);
			this.webs.deleteCategoria(oCategoria._id)
				.then( () => {
					this._loadCategorias( );
					oList.setBusy(false);
					MessageToast.show(`Categoria ${oCategoria.nm_categoria} eliminada com sucesso.`);
				})
				.catch( (err )=> {
					oList.setBusy(false);
					MessageBox.error(err, {
						styleClass: 'sapUiSizeCompact'
					});
				});
		}

	});
});