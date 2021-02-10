sap.ui.define([ "sap/ui/core/mvc/Controller",
		"de/arvato/GRModul01/libs/Helper", 'sap/m/MessageToast' ], function(
		Controller, Helper, MessageToast) {
	"use strict";

	var __SignatureControllerContext = {

		onInit : function() {

			var oMessageManager, oLocalModel, oView;

			oView = this.getView();

			// set message model
			oMessageManager = sap.ui.getCore().getMessageManager();
			oView.setModel(oMessageManager.getMessageModel(), "message");

			// or just do it for the whole view
			oMessageManager.registerObject(oView, true);

			this._oLocalModel = this.getOwnerComponent().getModel("local");
			this._oI18nBundle = this.getOwnerComponent().getModel("i18n")
					.getResourceBundle();

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("RouteSignature").attachMatched(
					this._onObjectMatched, this);

			this._oNameExtern = this.getView().byId("idNameExtern");
			this._oNameExtern.addEventDelegate({
				onfocusout : function(o) {
					if (this._oNameExtern.getValue()) {
						this._oNameExtern.setValueState("None");
					}
				}
			}, this);
		},

		_onObjectMatched : function(oEvent) {
			this.getView().byId("idNameExtern").setValueState("None"); 
			this.getView().byId("idTimePicker02").setValueState("None");			
		},

		onNavBack : function() {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("RouteGoodsReceipt");
		},

		onNavForward : function() {

			var bValidationError = false;

			var sValue02 = this.getView().byId("idTimePicker02").getValue();
			if (!sValue02) {
				this.getView().byId("idTimePicker02").setValueState(
						sap.ui.core.ValueState.Error);
				bValidationError = true;
			} else {
				this.getView().byId("idTimePicker02").setValueState(
						sap.ui.core.ValueState.None);
			}

			var aInputs = [ this.getView().byId("idNameExtern"),
					this.getView().byId("idNameIntern") ];

			if (!Helper.isInputValid(aInputs, null) || bValidationError) {
				sap.m.MessageToast.show(this._oI18nBundle
						.getText("General.InputNotComplete"), {
					at : "center center"
				});
				return;
			}

			var that = this;
			this._oLocalModel.setProperty("/CmrRefState", this._oLocalModel
					.getProperty("/Check/State/PreEntryCompleted"));
			this.getOwnerComponent()._saveCheck(
					function() {

						var sMsg = that._oI18nBundle
								.getText("textDriverSignatureConfirmation");
						sap.m.MessageBox.warning(sMsg, {
							onClose : function(oAction) {
								that.getOwnerComponent().clearFormularData();
								var oRouter = sap.ui.core.UIComponent
										.getRouterFor(that);
								oRouter.navTo("RouteMain");
							}
						});

					});
		},

		onGoToSemanticObject : function(oEvent) {

			this.getOwnerComponent().goToSemanticObject(
					{
						SemanticObject : oEvent.getSource().data(
								"SemanticObject"),
						Action : oEvent.getSource().data("action"),
						Parameters : {
							"EmployeeID" : this._oLocalModel
									.getProperty("/Employee/ID")
						}
					});
		},

		onTimeClosingChange : function(oEvent) {

			this.getOwnerComponent()._checkTime({
				SourcePicker : oEvent.getSource()
			});

			if (oEvent.getSource().getValue()) {
				oEvent.getSource().setValueState("None");
			}
		},
	};

	return Controller.extend("de.arvato.GRModul01.controller.Signature",
			__SignatureControllerContext);
});
