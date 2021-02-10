sap.ui.define([
	"sap/ui/core/mvc/Controller", "de/arvato/GRModul01/libs/Helper", 'sap/m/MessageToast'
], function(Controller, Helper, MessageToast) {
    "use strict";

    return Controller.extend("de.arvato.GRModul01.controller.Loading2", {

	onInit : function() {
		
		var oMessageManager, oLocalModel, oView;

		oView = this.getView();

		    // set message model
		oMessageManager = sap.ui.getCore().getMessageManager();
		oView.setModel(oMessageManager.getMessageModel(), "message");

		    // or just do it for the whole view
		oMessageManager.registerObject(oView, true);

	    this._oLocalModel = this.getOwnerComponent().getModel("local");
	    this._oErpModel = this.getOwnerComponent().getModel("erp");
	    this._oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
	    
	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.getRoute("RouteLoading2").attachMatched(this._onObjectMatched, this);
	    
	        
	    this._oSpedition = this.getView().byId("idInputSpedition");
	    this._oSpedition.addEventDelegate({
		    onfocusout : function(o) {
		    	if(this._oSpedition.getValue()){
		    		this._oSpedition.setValueState("None");
		    	}
		    }
		}, this);	 
	    
	    this._oVehicleReg = this.getView().byId("idInputVehicleReg");
	    this._oVehicleReg.addEventDelegate({
		    onfocusout : function(o) {
		    	if(this._oVehicleReg.getValue()){
		    		this._oVehicleReg.setValueState("None");
		    	}
		    }
		}, this);	
	},
	
	_onObjectMatched : function(oEvent) {
		this.getView().byId("idInputSpedition").setValueState("None"); 
		this.getView().byId("idInputVehicleReg").setValueState("None");
		this.getView().byId("idTimePicker01").setValueState("None");
	},

	onNavBack : function() {
	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.navTo("RouteLoading1", {
		path : "Loading1"
	    });
	},

	onNavForward : function() {
	    
	    var bValidationError = false;
	    
	    var aGroups = [
	    ];

	    var aInputs = [
		    this.getView().byId("idInputSpedition"), this.getView().byId("idInputVehicleReg")
	    ];

	    if (!Helper.isInputValid(aInputs, null, aGroups)) {		
	    	bValidationError = true;
	    }
	    
	    var sValue01 = this.getView().byId("idTimePicker01").getValue();
	    if (!sValue01){
		this.getView().byId("idTimePicker01").setValueState(sap.ui.core.ValueState.Error);		
		bValidationError = true;
	    } else {
		this.getView().byId("idTimePicker01").setValueState(sap.ui.core.ValueState.None);
	    }
	        
	    
	    if (bValidationError){
		sap.m.MessageToast.show(this._oI18nBundle.getText("General.InputNotComplete"), {
		    at : "center center"
		});
		return;
	    }
	    
	    var that = this;
//	    this.getOwnerComponent()._updateCheck(function(sCmrRef) {
//		var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
//		oRouter.navTo("RouteGoodsReceipt");
//	    });
//	    
	    this.getOwnerComponent()._saveCheck(function(sCmrRef) {
		var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
		oRouter.navTo("RouteGoodsReceipt");
	    });
	},
		
	onTimeOpeningChange: function(oEvent) {

		this.getOwnerComponent()._checkTime({
			SourcePicker: oEvent.getSource()
		});
		
		if (oEvent.getSource().getValue()){
			oEvent.getSource().setValueState("None");
		}
	},	
	
	onGoToSemanticObject : function(oEvent) {

	    this.getOwnerComponent().goToSemanticObject({
		SemanticObject : oEvent.getSource().data("SemanticObject"),
		Action : oEvent.getSource().data("action"),
		Parameters : {
		    "EmployeeID" : this._oLocalModel.getProperty("/Employee/ID")
		}
	    });
	},

    });
});
