sap.ui.define([
	"./Base",
	"../model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function(BaseController, formatter, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("sap.ui.demo.basicTemplate.controller.ImportarArquivo", {

		formatter: formatter,

		onInit: function () {

			this.getRouter().getTarget("importar_arquivo").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));

			const { join } = nodeRequire("path");
			const { remote } = nodeRequire("electron");
			this.webs = remote.require(join(__dirname, "..", "electron", "web_services.js"));

		},

		sContaId: null,

		handleRouteMatched: function  (oEvt) {

			this.sContaId = oEvt.getParameter("data").cnt;

			var oView = this.getView();
			oView.setModel(new JSONModel([]), "imp_arq");

			oView.setModel(new JSONModel({
				"TableImpArqMode" : "MultiSelect"
			}), "conf");

			oView.setModel(new JSONModel({
				"nr_referencia" : "",
				"descricao" : "C",
				"data" : "A",
				"valor" : "D",
			}), "field-map");

			oView.setModel(new JSONModel({
				"FormatoData" : "DD-MM-YYYY",
				"DecSeparator" : ".",
				"MilSeparator" : ","
			}), "conf-user");

		},

		onBackPress: function () {
			const electron = nodeRequire("electron");
			const ipc = electron.ipcRenderer;
			ipc.send("go-back-button");
		},

		onUploadFilePress: function (oEvt) {
			this.webs.openAndParseFile((oParsedJson) => {
				this.getView().getModel("imp_arq").setProperty("/", oParsedJson);	
			});

			// var that = this;
			// var oFileUploader = this.byId("fileUploader");
			// oFileUploader.checkFileReadable().then(function() {
			// 	oFileUploader.upload();
			// }, function(error) {
			// 	MessageToast.show("Não foi possivel ler o arquivo. Ele pode ter sido modificado.");
			// }).then(function() {
			// 	oFileUploader.clear();
			// });
		},
		onUploadCompleto: function (oEvt) {
			var oParsedJson = JSON.parse(oEvt.getParameter("responseRaw"));
			this.getView().getModel("imp_arq").setProperty("/", oParsedJson);

		},

		onBtnElimLinhasPress: function (oEvt) {
			var oModel = this.getView().getModel("conf");
			oModel.setProperty("/TableImpArqMode", 
				oModel.getProperty("/TableImpArqMode") === "MultiSelect" ? "Delete" : "MultiSelect"
			);
		},
		
		onTableImpArqDeletePress: function (oEvt) {
			var oModel = this.getView().getModel("imp_arq");
			var oListItem = oEvt.getParameter("listItem");
			var aData = oModel.getData();
			var iIndex = oListItem.getBindingContextPath().replace("/", "")
			aData.splice(iIndex, 1);
			oModel.setData(aData);
		},

		onBtnImportarLinhasPress: function (oEvt) {
			var oTable = this.getView().byId("idTblImportarArquivo"); 
			var aSelected = oTable.getSelectedContexts();
			if (aSelected.length < 0) { 
				MessageToast.show("Selecionar ao menos uma linha");
				return; 
			}

			// var oValuesModel = this.getView().getModel("imp_arq");
			var oMapModel = this.getView().getModel("field-map");
			var oMap = oMapModel.getProperty("/");

			for (var i in aSelected) {
				var oValues = aSelected[i].getObject();

				var sRef = oValues[oMap.nr_referencia] || "";
				var sDescr = oValues[oMap.descricao] || "";
				var sValor = this._formatCurr( oValues[oMap.valor] );
				var sData = this._formatDate( oValues[oMap.data] );

				var that = this;
				// var sURL = "/conta/" + this.sContaId + "/lancamentos";

				this.webs.newLancamento(
					{
						// eslint-disable-next-line camelcase
						conta_id: that.sContaId,
						// eslint-disable-next-line camelcase
						nr_referencia: sRef,
						descricao: sDescr,
						data: sData,
						valor: sValor
					},
					(response) => 
						MessageToast.show(
							`Lancamento adicionado de ${response.data} valor ${response.valor}`
					) 
				);

				// $.post(sURL, 
				// 	{
				// 		conta_id: that.sContaId,
				// 		nr_referencia: sRef,
				// 		descricao: sDescr,
				// 		data: sData,
				// 		valor: sValor
				// 	},
				// 	function (response) {
				// 		MessageToast.show("Inserido item X.");
				// 	}
				// );
			}
		},

		_formatCurr: function (sCurr) {
			if (!sCurr) { return 0; }
			if (typeof sCurr === "number") { return sCurr; }
			var oConfUsModel = this.getView().getModel("conf-user");
			var oConfUs = oConfUsModel.getProperty("/");
			return parseFloat(sCurr.replace(oConfUs.MilSeparator,"").replace(oConfUs.DecSeparator, "."));
		},

		_formatDate: function (sDate) {
			if (!sDate) { return ""; }
			var oConfUsModel = this.getView().getModel("conf-user");
			var sFormatoData = oConfUsModel.getProperty("/FormatoData");

			var iDIndex = sFormatoData.search("DD");
			var iMIndex = sFormatoData.search("MM");
			var iYIndex = sFormatoData.search("YYYY");
			var sDay   = sDate.substr(iDIndex, 2);
			var sMonth = sDate.substr(iMIndex, 2);
			var sYear  = sDate.substr(iYIndex, 4);
			
			return sYear + "-" + sMonth + "-" + sDay;

		}

	});
});