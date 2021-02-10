sap.ui.define([
	"sap/ui/core/mvc/Controller", "de/arvato/GRModul01/libs/Helper", "sap/m/MessageBox"
], function(Controller, Helper, MessageBox) {
    "use strict";

    return Controller.extend("de.arvato.GRModul01.controller.Loading1", {

	onInit : function() {
	    //
	    // sap.ui.getCore().getMessageManager().registerObject(this.getView(),
		// true);
	    var oMessageManager, oLocalModel, oView;
	    var that = this;

	    oView = this.getView();
		// set message model
	    oMessageManager = sap.ui.getCore().getMessageManager();
	    oView.setModel(oMessageManager.getMessageModel(), "message");

	    // or just do it for the whole view
	    oMessageManager.registerObject(oView, true);
	    

	    this._oLocalModel = this.getOwnerComponent().getModel("local");

	    //
	    var oDate = new Date();
	    this._oLocalModel.setProperty("/currentDate", oDate);

	    this._oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

	    // var sRoughGR = this._oLocalModel.getProperty("/Loading1/RoughGR");
	    // if (sRoughGR) {
	    // this.getView().byId("idRoughGRComboBox").setSelectedKey(sRoughGR);
	    // }

	    // var sTemperatureKey =
		// this._oLocalModel.getProperty("/Loading1/Temperature/key");
	    // if (sTemperatureKey) {
	    // this.getView().byId("idTemperatureComboBox").setSelectedKey(sTemperatureKey);
	    // }

	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.getRoute("RouteLoading1").attachMatched(this._onObjectMatched, this);

	    // this.getView().onAfterRendering = function() {
	    // sap.ndc.BarcodeScanner.scan(function(sResult) {
	    // that.getOwnerComponent()._readEmployee(sResult.text, function() {
	    // // var obutton = that.getview().byid("idnavforwardbutton");
	    // // obutton.firepress();
	    // });
	    // });
	    // }
	    
//	    var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
//	    this.oTrigger = new sap.ui.core.IntervalTrigger(5000);
//	    this.oTrigger.addListener(function() {
//		if (oRoughGRComboBox) {
//		    var oBinding = oRoughGRComboBox.getBinding("items");
//		    if (oBinding) {
//		    	oBinding.refresh();
//		    }
//		}
//
//	    }.bind(this));
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
	
	onRoughGRReceived: function(eEvent) {
		
		if (this._oLocalModel.getProperty("/Loading1/RoughGR")){		
			var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
			var oItem = oRoughGRComboBox.getItemByKey(this._oLocalModel.getProperty("/Loading1/RoughGR"));
			if (oItem){
				var oBindingContext = oItem.getBindingContext("erp");
				var oObject = oBindingContext.getObject();
				this._oLocalModel.setProperty("/Loading1/Zbetrst", oObject.Zbetrst);
			}
		}
	},

	_onObjectMatched : function(oEvent) {

	    var oRoughGRComboBox = this.getView().byId("idRoughGRComboBox");
	    if (oRoughGRComboBox.getBinding("items")){
	    	oRoughGRComboBox.getBinding("items").refresh();
	    }
	    oRoughGRComboBox.setValueState("None");

	    var oRoughGR = this._oLocalModel.getProperty("/Loading1/RoughGR");
	    if (!oRoughGR.length) {
		oRoughGRComboBox.setSelectedKey();
	    }
	    else {
	    	oRoughGRComboBox.setSelectedKey(oRoughGR);    	
	    }

	    var oTemperatureComboBox = this.getView().byId("idTemperatureComboBox");
	    oTemperatureComboBox.setValueState("None");
	    var iIndex = 0;
	    var aKeys = this._oLocalModel.getProperty("/Loading1/TemperatureList");
	    // for (iIndex in aKeys){
	    	oTemperatureComboBox.setSelectedKeys(aKeys);
	    // }
// var oTemperature = this._oLocalModel.getProperty("/Loading1/Temperature");
// if (oTemperature.key === undefined) {
// oTemperatureComboBox.setSelectedKey();
// }
// else {
// oTemperatureComboBox.setSelectedKey(oTemperature.key);
// }
	},

	onNavBack : function() {
		this.getOwnerComponent().clearFormularData();
	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.navTo("RouteMain");
	},

	onNavForward : function() {

		var bValidationError = false;
		
	    var aInputs = [
		    // this.getView().byId("idCMRReference"),
		    // this.getView().byId("idDatePicker1")
	    ];
	    var aItems = [
		    this.getView().byId("idRoughGRComboBox")
		    // , this.getView().byId("idTemperatureComboBox")
	    ];
	    
	    var aGroups =[
	    	this.getView().byId("idCombinationGRGroup")
	    ];

	    if (!Helper.isInputValid(aInputs, aItems, aGroups)) {
	    	
	    	sap.m.MessageToast.show(this._oI18nBundle.getText("General.InputNotComplete"), {
	    		at : "center center"
	    	});
	    	bValidationError = true;
	    }    
	    
	    var oTempComboBox = this.getView().byId("idTemperatureComboBox");
	    if(oTempComboBox){
	    	if (oTempComboBox.getSelectedKeys().length == 0){
	    		oTempComboBox.setValueState("Error");
	    		sap.m.MessageToast.show(this._oI18nBundle.getText("General.InputNotComplete"), {
	    		    at : "center center"
	    		});
	    		bValidationError = true;
	    	}	    	
	    }
	    
	    if(bValidationError){
	    	return;
	    }	    

	    // An hier wird Status "in Bearbeitung" gesetzt!
	    // Domit soll vermieden werden, dass mehrere Mitarbeiter gleichzeitig
		// ein CMR
	    // aus der Liste "der Offenen" ziehen können!
	    this._oLocalModel.setProperty("/CmrRefState", "10");
	    
	    var that = this;
	    if (this._oLocalModel.getProperty("/CmrRefCreated")) {
	    
	    	this.getOwnerComponent()._updateCheck(function(sCmrRef) {
	    		var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
	    		oRouter.navTo("RouteLoading2");
	    	});
	    
	    } else {

	    	this.getOwnerComponent()._saveCheck(function(oData) {

			    var sMsg = that._oI18nBundle.getText("General.CMRCreateSuccessfull", [
			    	oData.CmrRef
			    ]);
	
			    that._oLocalModel.setProperty("/Loading1/CheckId", oData.CheckId);
			    that._oLocalModel.setProperty("/Loading1/CmrRef", oData.CmrRef);
			    that._oLocalModel.setProperty("/Loading1/CheckEditable", false);
			    
			    sap.m.MessageToast.show(sMsg, {
			    	duration : 500,
				    at : "center center",
				    onClose: function() {
				    	var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("RouteLoading2");
					}.bind(this)
			    });
			   
		    
// sap.m.MessageBox.information(sMsg, {
// onClose : function(oAction) {
// var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
// oRouter.navTo("RouteLoading2");
// }
// });

	    	});
	    }
	},

	onEmployeeBarcodeScanSuccess : function(oEvent) {
	    var that = this;
	    var sText = oEvent.getParameter("text");
	    this.getOwnerComponent()._readEmployee(sText, function() {
	    });
	},
	
	onCMRChangeButtonPress: function(oEvent) {

		 this.getOwnerComponent()._deleteCheck({
				 CheckId: this._oLocalModel.getProperty("/Loading1/CheckId")
		 }, function() {
			 this._oLocalModel.setProperty("/Loading1/CheckEditable", true);
		 }.bind(this));
	},

	onRoughGRSelectionChange : function(oEvent) {

	    var oLocalModel = this.getView().getModel('local');
	    var oItem = oEvent.getParameter("selectedItem");
	    if (oItem){
		    var oObject = oItem.getBindingContext("erp").getObject();
		    if (oObject){
		    	oLocalModel.setProperty("/Loading1/RoughGR", oItem.getKey());
		    	oLocalModel.setProperty("/Loading1/Client", oObject.Mandt);
		    	oLocalModel.setProperty("/Loading1/Zbetrst", oObject.Zbetrst);		    	
		    	
		    	oEvent.getSource().setValueState("None");
		    	
		    	var oErpModel = this.getView().getModel("erp");
		    	oErpModel.read("/RoughGRSet('" + oObject.Zgweno + "')/Check", {
	    			success : function(oData, oResponse) {	
	
	    				MessageBox.show(this._oI18nBundle.getText("Loading.RoughGRAlreadyLinked", [oObject.Zgweno]), {
	    							icon: MessageBox.Icon.INFORMATION,
	    							title: this._oI18nBundle.getText("General.MakeChoice"),
	    							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
	    							onClose: function(oAction) {
	    								if (oAction === MessageBox.Action.NO){
	    									this.getView().byId("idRoughGRComboBox").setSelectedKey();
	    								}
	    							}.bind(this)
	    						}
	    					);
	    				
	    				
	    			}.bind(this),
	    			error : function(oError) {
	    				//Keine Pruefung gefunden, alles OK!
	    				sap.ui.getCore().getMessageManager().removeAllMessages();
	    			}.bind(this)
	    		});
		    	
		    }
	    }
	    // oLocalModel.setProperty("/Loading1/Erdat", oObject.Erdat);
	},

	// onRoughGRScanSuccess : function(oEvent) {
	//
	// var sRoughGR = oEvent.getParameter("text");
	// if (!sRoughGR){
	// return;
	// }
	//
	// if (this.getView().byId("idRoughGRComboBox").getItemByKey(sRoughGR)) {
	// this.getView().byId("idRoughGRComboBox").setSelectedKey(sRoughGR);
	// }
	// else {
	// sap.m.MessageToast.show(this._oI18nBundle.getText("Loading.RoughGRNotFound",
	// sRoughGR));
	// }
	// },

	onRoughGRInputSuccess : function(oEvent) {
	    var sRoughGR = oEvent.getParameter("value");
	    if (!sRoughGR) {
	    	return;
	    }

	    var oComboBox = this.getView().byId("idRoughGRComboBox");
	    var oSelectedItem = oComboBox.getItemByKey(sRoughGR);
	    if (oSelectedItem) {
	    	oComboBox.setSelectedKey(sRoughGR);
	    	oComboBox.fireSelectionChange({
	    		selectedItem: oSelectedItem
	    	});
	    }
	    else {
	    	sap.m.MessageToast.show(this._oI18nBundle.getText("Loading.RoughGRNotFound", sRoughGR));
	    }
	},

	onRoughGRScanFail : function() {
	    //debugger;
	},
	
	onTemperatureSelectionFinish: function(oEvent) {
		
		var aSelectedKeys = oEvent.getSource().getSelectedKeys();
		if(aSelectedKeys.length > 0){
			this._oLocalModel.setProperty("/Loading1/TemperatureList", aSelectedKeys);
			oEvent.getSource().setValueState("None");
		}
	},

	onTemperatureSelectionChange : function(oEvent) {

	    var oChangedItem = oEvent.getParameter("changedItem");
	    var bSelected = oEvent.getParameter("selected");	
	    if (oChangedItem) {    		    	

	    	var oBindingContext = oChangedItem.getBindingContext("erp");
	    	var oObject = oBindingContext.getObject();
	    	
	    	if (oObject.Value == "9") {	    		

	    		if (bSelected){
	    			Helper.getReasonDialog({
	    				bundle: this._oI18nBundle,
		   				source : oChangedItem,
		   				abort : function(oItem) {
		   					// oItem.getParent().setSelectedKey();
		   				}.bind(this),
		   				success : function(oItem, sReasonText) {
		   					this.getView().byId("idTemperatureComboBox").addSelectedItem(oItem);
		   					this._oLocalModel.setProperty("/Loading1/Temperature/reasonText", sReasonText);		   					
		   				}.bind(this),
		   				title : this._oI18nBundle.getText("Loading.TemperatureReasonTitle"),
		   				text : this._oI18nBundle.getText("Loading.TemperatureReasonText")
		   			}).open();
	    		} else {
	    			this._oLocalModel.setProperty("/Loading1/Temperature/reasonText", "");
	    		}
	    	}
	    }
	}
    
    });
});
