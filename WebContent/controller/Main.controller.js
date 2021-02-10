sap.ui.define([
	'sap/m/MessageToast', 'sap/m/Button', 'sap/m/Dialog', 'sap/m/Label', 'sap/m/Text', 'sap/m/TextArea',
	"sap/ui/model/json/JSONModel", "sap/ui/core/mvc/Controller", "de/arvato/GRModul01/libs/Helper",
	"sap/ui/core/routing/History"
], function(MessageToast, Button, Dialog, Label, Text, TextArea, JSONModel, Controller, Helper, History) {
    "use strict";

    return Controller.extend("de.arvato.GRModul01.controller.Main", {

	/**
	 * @memberOf Main.onInit
	 * @author step019
	 */
	onInit : function() {
	    /*
	     * sap.ui.getCore().attachParseError(this._parseErrorHandler, this);
	     * sap.ui.getCore().attachValidationSuccess(this._onValidationSuccess, this);
	     */

	    //
	    // sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
	    var oMessageManager, oLocalModel, oView;

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

	    var oEmployeeID;

	    var oComponentData = this.getOwnerComponent().getComponentData();
	    if (oComponentData) {
		if (oComponentData.hasOwnProperty("startupParameters")) {
		    oEmployeeID = oComponentData.startupParameters['EmployeeID'];
		}
	    }

	    if (oEmployeeID && oEmployeeID.length > 0) {
		this.getOwnerComponent()._readEmployee(oEmployeeID[0], function() {
		});
	    }
	    else {
		var that = this;
		this.getView().onAfterRendering = function() {
		    // sap.ndc.BarcodeScanner.scan(function(sResult) {
		    // that.getOwnerComponent()._readEmployee(sResult.text, function() {
		    // // var obutton = that.getview().byid("idnavforwardbutton");
		    // // obutton.firepress();
		    // });
		    // });

		    var oScanButton = this.getView().byId("idScanButton");
		    if (oScanButton) {
		    	oScanButton._onPress();
		    }
		}.bind(this)
	    }
	    
	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.getRoute("RouteMain").attachMatched(this._onObjectMatched, this);

	},
	
	_onObjectMatched : function(oEvent) {
		
		var sLgnum = this._oLocalModel.getProperty("/Employee/Lgnum");
		if (sLgnum){
		this.getOwnerComponent()._readOpenChecks(
			sLgnum, function(aOpenChecks){
	    		 this._oLocalModel.setProperty("/OpenCheckList", aOpenChecks);
	    	}.bind(this));
		}
		
		this.getView().byId("idCheckList").removeSelections(true);
		
		var oList = this.getView().byId("idCheckList");
	    oList.setMode("SingleSelectMaster");
	},

	onNavBack : function() {
	    var oHistory = History.getInstance();

	    if (sPreviousHash !== undefined) {
	    	window.history.go(-1);
	    }
	    else {
		var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		oRouter.navTo("RouteMain", true);
	    }
	},

	onNavForward : function() {

	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    // Über den Namen der Route (RouteLoading1) wird das Bild angesteuert
	    // Pattern wird in Browser-Link angezeigt.

	    if (this._oLocalModel) {

		if (this._oLocalModel.getProperty("/Employee/Name")) {
		    oRouter.navTo("RouteLoading1", {
			path : "Loading1"
		    });
		}
		else {
		    MessageToast.show(this._oI18nBundle.getText("Main.EmployeeBarcodeMustBeScaned"), {
			at : "center center"
		    });
		}
	    }
	},

//	onClearButtonPress : function() {
//	    this.getOwnerComponent().clearFormularData();
//	    this.getView().byId("idCheckList").removeSelections(true);
//
//	    this.onNavForward();
//	},

	onModeChangeButtonPress : function() {
	    var oList = this.getView().byId("idCheckList");
	    var sMode = oList.getMode();
	    switch (sMode) {
	    case "Delete":
	    	sMode = "SingleSelectMaster";
		break;
	    case "SingleSelectMaster":
	    	sMode = "Delete";
		break;
	    }

	    oList.setMode(sMode);
	},

	/*_getReasonDialog : function(oContext) {

	    var that = this;
	    var sText;

	    if (!this._oReasonDialog) {

		this._oReasonDialog = new Dialog({
		    title : oContext.title,
		    type : 'Message',
		    content : [
			    new Label({  text: oContext.text, 
				labelFor : 'submitDialogTextarea'
			    }), new TextArea('submitDialogTextarea', {
				liveChange : function(oEvent) {
				    var sText = oEvent.getParameter('value');
				    var parent = oEvent.getSource().getParent();
				    parent.getBeginButton().setEnabled(sText.length > 0);
				},
				width : '100%',
				placeholder : 'Add note (required)'
			    })
		    ],
		    beginButton : new Button({
			text : 'Übernehmen',
			enabled : false,
			press : function() {
			    sText = sap.ui.getCore().byId('submitDialogTextarea').getValue();
			    that.getView().getModel("local").setProperty(oContext.property, sText);
			    that._oReasonDialog.close();
			}
		    }),
		    endButton : new Button({
			text : 'Abbrechen',
			press : function() {
			    that.getView().getModel("local").setProperty(oContext.selectedProperty, true);
			    that._oReasonDialog.close();
			}
		    })
		});
	    }

	    return this._oReasonDialog;
	},*/

	// onEmployeeBarcodeScanSuccess : function(oEvent) {
	//
	// var that = this;
	// var sText = oEvent.getParameter("text");
	// this.getOwnerComponent()._readEmployee(sText, function() {
	// });
	// },

	onEmployeeInputSuccess : function(oEvent) {
	    var sEmployeeIdent = oEvent.getParameter("value");
	    this.getOwnerComponent()._readEmployee(sEmployeeIdent, function() {
	    	this.getOwnerComponent()._readOpenChecks(
	    		this._oLocalModel.getProperty("/Employee/Lgnum"), function(aOpenChecks){
	    			 this._oLocalModel.setProperty("/OpenCheckList", aOpenChecks);
	    		}.bind(this));
	    }.bind(this));
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

	onCheckSelectionChange : function(oEvent) {

	    var oBindingObject = oEvent.getParameter("listItem").getBindingContext("local").getObject();
	    if (oBindingObject) {

		// 
		if (oBindingObject.State != this._oLocalModel.getProperty("/Check/State/Open")) {

		    var sActionAccept = this._oI18nBundle.getText("General.Accept");
		    var sActionAbort = this._oI18nBundle.getText("General.Abort");

		    var sText = this._oI18nBundle.getText("Main.CheckInWork", oBindingObject.CmrRef) + "\n"
			    + this._oI18nBundle.getText("Main.CheckTakeOver");

		    var that = this;
		    sap.m.MessageBox.show(sText, {
			icon : sap.m.MessageBox.Icon.WARNING,
			actions : [
				sActionAccept, sActionAbort
			],
			initialFocus : sap.m.MessageBox.Action.NO,
			onClose : function(sAction) {
			    switch (sAction) {
			    case sActionAccept:
				that._oLocalModel.setProperty("/CmrRefState", "00");
				that.getOwnerComponent()._setCheck(oBindingObject);
				that._oLocalModel.setProperty("/Loading1/CheckEditable", false);
				// und weiter!
				that.onNavForward();
				break;
			    case sActionAbort:
				return;
			    }
			}
		    });
		}

		//this._oLocalModel.setProperty("/CmrRefCreated", true);

	    }
	},

	onCheckDeletion : function(oEvent) {

		var oBindingContext = oEvent.getParameter("listItem").getBindingContext("local");
	    var oBindingObject = oBindingContext.getObject();
	    this.getOwnerComponent()._deleteCheck(oBindingObject, function() {
	    	this.getOwnerComponent()._readOpenChecks(
		    		this._oLocalModel.getProperty("/Employee/Lgnum"), function(aOpenChecks){
		    			 this._oLocalModel.setProperty("/OpenCheckList", aOpenChecks);
		    		}.bind(this));
	    }.bind(this));
	},

	onMessagePopoverPress : function(oEvent) {
	    this._getMessagePopover().openBy(oEvent.getSource());
	},

	_getMessagePopover : function() {
	    // create popover lazily (singleton)
	    if (!this._oMessagePopover) {
		this._oMessagePopover = sap.ui.xmlfragment(this.getView().getId(),
			"de.arvato.GRModul01.fragment.MessagePopover", this);
		this.getView().addDependent(this._oMessagePopover);
	    }
	    return this._oMessagePopover;
	},

	setDefaultDate : function(o) {
	    var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
		pattern : "yyyy-MM-dd"
	    });
	    var date = new Date();
	    return dateFormat.format(date);
	}

    });
});
