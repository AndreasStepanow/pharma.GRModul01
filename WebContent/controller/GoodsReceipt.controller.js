sap.ui.define([
	"sap/ui/core/mvc/Controller", "de/arvato/GRModul01/libs/Helper", 'sap/m/MessageToast'
], function(Controller, Helper, MessageToast) {
    "use strict";

    return Controller.extend("de.arvato.GRModul01.controller.GoodsReceipt", {

	onInit : function() {
		
		var oMessageManager, oLocalModel, oView;

		oView = this.getView();

		// Erstellen MessageManager! 
		oMessageManager = sap.ui.getCore().getMessageManager();
		oView.setModel(oMessageManager.getMessageModel(), "message");

		    // or just do it for the whole view
		oMessageManager.registerObject(oView, true);
		

	    this._oLocalModel = this.getOwnerComponent().getModel("local");
	    this._oI18nBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.getRoute("RouteGoodsReceipt").attachMatched(this._onObjectMatched, this);
	},

	_onObjectMatched : function(oEvent) {
		this.getView().byId("idCmrGroup").setValueState("None"); 
		this.getView().byId("idPrintoutGroup").setValueState("None");
		this.getView().byId("idPlombGroup").setValueState("None");
		this.getView().byId("idTLogGroup").setValueState("None");
		this.getView().byId("idColliCountGroup").setValueState("None");
		this.getView().byId("idColliStateGroup").setValueState("None");
		this.getView().byId("idPalettHTGroup").setValueState("None");
	},

	onNavBack : function() {
	    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
	    oRouter.navTo("RouteLoading2");
	},

	onNavForward : function() {

	   var aGroups = [
		    this.getView().byId("idCmrGroup"), this.getView().byId("idPrintoutGroup"), 
		    this.getView().byId("idPlombGroup"), this.getView().byId("idTLogGroup"), 
		    this.getView().byId("idColliCountGroup"), this.getView().byId("idColliStateGroup"), 
		    this.getView().byId("idPalettHTGroup"), 
		    
	    ];

	    if (!Helper.isInputValid(null, null, aGroups)) {
			sap.m.MessageToast.show(this._oI18nBundle.getText("General.InputNotComplete"), {
			    at : "center center"
			});
			return;
	    }
	    
	    // Check SNR-Logger, falls Ja!
	    if (this._oLocalModel.getProperty("/GoodsReceipt/ExistTLog/yes")){
	    	var aLogger = this._oLocalModel.getProperty("/GoodsReceipt/ExistTLog/SerialNumbers");
	    	if (aLogger.length < 1){
	    			    		
	 		    sap.m.MessageBox.show(this._oI18nBundle.getText("General.LoggerNotComplete"), {
	 		    	icon : sap.m.MessageBox.Icon.WARNING,
	 		    	actions : [
	 		    		sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.ABORT 
	 		    		],
	 		    	initialFocus : sap.m.MessageBox.Action.YES,
	 		    	onClose : function(sAction) {
	 		    		if (sAction === sap.m.MessageBox.Action.YES){
	 		    			this.onPressTemperatureLogger();
	 		    		}
	 		    	}.bind(this)
	 		    });	    		
	    		
	    		return;
	    	}
	    }
	    
	 
	    var that = this;
//	    this.getOwnerComponent()._updateCheck(function(sCmrRef) {
//		var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
//		oRouter.navTo("RouteSignature");
//	    });
	    
	    this.getOwnerComponent()._saveCheck(function(sCmrRef) {
			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			oRouter.navTo("RouteSignature");
	    });
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
	
	onDlvCmrExistSelect: function(oEvent) {
		 if (oEvent.getParameter("selectedIndex") > -1){
		    	oEvent.getSource().setValueState("None");
		 }
	},

	onTempPrintoutSelect : function(oEvent) {

	    //var oSelectedIndex = oEvent.getParameter("selectedIndex");
	    var oRadioButtonSrc = oEvent.getSource().getAggregation("buttons");

	    // Index 0 = Yes
	    // Index 1 = No (Nein selektiert, soll Meldung ausgegeben werde)
	    if (oRadioButtonSrc[1].getSelected()) {
	    	var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
	    	MessageToast.show(oBundle.getText("GoodsReceipt.TempPrintoutExistCom"), {
	    		duration : 5000,
	    		at : "center center"
	    	});
	    }
	    
	    if (oEvent.getParameter("selectedIndex") > -1){
	    	oEvent.getSource().setValueState("None");
	    }
	},
	
	onReasonSelect: function(oEvent) {
		//debugger;
	},

	onPlombNumberSelect : function(oEvent) {

	    //var oSelectedIndex = oEvent.getParameter("selectedIndex");
	    var oRadioButtonSrc = oEvent.getSource().getAggregation("buttons");

	    if (oRadioButtonSrc[1].getSelected()) {

			var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			    
			//this._getReasonDialog().open();
			Helper.getReasonListDialog({
				bundle: oBundle,
				selectedKey: this._oLocalModel.getProperty("/GoodsReceipt/ExistPlomb/key"),
				initValue: this._oLocalModel.getProperty("/GoodsReceipt/ExistPlomb/OtherReason"),
				field: "01", // Feld: "Plombel-Nr. korrekt lt. CMR", Siehe Definition Gründe: ZPHA_GR_REASONS
				title: oBundle.getText("ReasonDialog.Title"),
				model: this.getView().getModel("erp"),
				fnConfirm: function(oData) {
					this._oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/key", oData.reason);
					this._oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/OtherReason", oData.text);
				}.bind(this)
			}).open();
	
//			this._getPlombReasonDialog({
//			    selectedProperty : "/GoodsReceipt/ExistPlomb/no",
//			    //reasons : "local>/GoodsReceipt/ExistPlomb/Reasons",
//			    reasons : "erp>/PlombReasonSet",
//			    reason: "/GoodsReceipt/ExistPlomb/OtherReason",
//			    property : "/GoodsReceipt/ExistPlomb/key",
//			    title : oBundle.getText("Loading.PlombReasonTitle"),
//			    text : oBundle.getText("Loading.PlombReasonText")
//			}).open();
	    } else {
	    	this._oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/key", "");
			this._oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/OtherReason", "");
	    }
	    
	    if (oEvent.getParameter("selectedIndex") > -1){
	    	oEvent.getSource().setValueState("None");
	    }
	},
	
	onPressPlombNumberExist: function(oEvent) {
		var oGroup = this.getView().byId("idPlombGroup");
		oGroup.fireEvent("select", { buttons: oGroup.getButtons()});
	},
	
	onSelectTemperatureLoggerSelect : function(oEvent) {

	    var oSelectedIndex = oEvent.getParameter("selectedIndex");
	    var oRadioButtonSrc = oEvent.getSource().getAggregation("buttons");

	    if (oRadioButtonSrc[0].getSelected()) {
	    	this._getSerialNumberDialog().open();
	    }
	    
	    if (oEvent.getParameter("selectedIndex") > -1){
	    	oEvent.getSource().setValueState("None");
	    }
	},
	
	onPressTemperatureLogger: function(oEvent) {
		
		if(this.getView().byId("idRadio05").getSelected()){
			this._getSerialNumberDialog().open();
		}
	},

	onColliCountSelect : function(oEvent) {

	    //var oSelectedIndex = oEvent.getParameter("selectedIndex");
	    var oRadioButtons = oEvent.getSource().getAggregation("buttons");

	    if (oRadioButtons[1].getSelected()) {

	    	var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

	    	Helper.getReasonDialog({
	    		bundle: oBundle,
	    		initValue : this._oLocalModel.getProperty("/GoodsReceipt/ExistColliCnt/text"),
	    		source : oEvent.getSource(),
	    		abort : function(oRadioGroup) {
//	    			oRadioButtons = oRadioGroup.getAggregation("buttons");
//	    			oRadioButtons[1].setSelected(false);
	    		},
	    		success : function(oRadioGroup, sReasonText) {
	    			oRadioGroup.getModel("local").setProperty("/GoodsReceipt/ExistColliCnt/text", sReasonText);
	    		},
	    		title : this._oI18nBundle.getText("Loading.ColliCntReasonTitle"),
	    		text : this._oI18nBundle.getText("Loading.ColliCntReasonText"),
	    		bundle: this.getOwnerComponent().getModel("i18n").getResourceBundle()
	    	}).open();
	    } else {
	    	this._oLocalModel.setProperty("/GoodsReceipt/ExistColliCnt/text", "");
	    }	 
	    
	    if (oEvent.getParameter("selectedIndex") > -1){
	    	oEvent.getSource().setValueState("None");
	    }
	},
	
	onPressColliCountExist: function(oEvent) {
		var oGroup = this.getView().byId("idColliCountGroup");
		oGroup.fireEvent("select", { buttons: oGroup.getButtons()});
	},

	onColliStateSelect : function(oEvent) {
	    
	    var oRadioButtons = oEvent.getSource().getAggregation("buttons");
	    if (oRadioButtons[1].getSelected()) {

	    	var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();	    	
	    	
	    	Helper.getReasonListDialog({
	    		bundle: oBundle,
				selectedKey: this._oLocalModel.getProperty("/GoodsReceipt/ExistColliStt/key"),
				initValue: this._oLocalModel.getProperty("/GoodsReceipt/ExistColliStt/OtherReason"),
				field: "02", // Feld: "Zustand Colli", Siehe Definition Gründe: ZPHA_GR_REASONS
				title: oBundle.getText("ReasonDialog.Title"),
				model: this.getView().getModel("erp"),
				fnConfirm: function(oData) {
					this._oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/key", oData.reason);
					this._oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/OtherReason", oData.text);
				}.bind(this)
			}).open();
	    	
//	    	Helper.getReasonDialog({
//	    		initValue : this._oLocalModel.getProperty("/GoodsReceipt/ExistColliStt/text"),
//	    		source : oEvent.getSource(),
//	    		abort : function(oRadioGroup) {
////	    			oRadioButtons = oRadioGroup.getAggregation("buttons");
////	    			oRadioButtons[1].setSelected(false);
//	    		},
//	    		success : function(oRadioGroup, sReasonText) {
//	    			oRadioGroup.getModel("local").setProperty("/GoodsReceipt/ExistColliStt/text", sReasonText);
//	    		},
//	    		title : this._oI18nBundle.getText("Loading.ColliSttReasonTitle"),
//	    		text : this._oI18nBundle.getText("Loading.ColliSttReasonText")
//	    	}).open();
	    	
	    } else {
	    	this._oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/text", "");
	    }
	    
	    if (oEvent.getParameter("selectedIndex") > -1){
	    	oEvent.getSource().setValueState("None");
	    }
	},
	
	onPressColliStateExist: function(oEvent) {
		var oGroup = this.getView().byId("idColliStateGroup");
		oGroup.fireEvent("select", { buttons: oGroup.getButtons()});
	},
	
	onHTFlagSelect : function(oEvent) {

	    //var oSelectedIndex = oEvent.getParameter("selectedIndex");
	    var oRadioButtons = oEvent.getSource().getAggregation("buttons");
	    var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

	    if (oRadioButtons[1].getSelected()) {	    	
	    	
	    	this._oLocalModel.setProperty("/GoodsReceipt/PalettHt/keys", []);
	    	
	    	Helper.getReasonListDialog({	
	    		bundle: oBundle,
				selectedKey: this._oLocalModel.getProperty("/GoodsReceipt/PalettHt/key"),
				initValue: this._oLocalModel.getProperty("/GoodsReceipt/PalettHt/OtherReason"),
				field: "03", // Feld: "Palette mit HT-Kennzeichnung", Siehe Definition Gründe: ZPHA_GR_REASONS
				title: oBundle.getText("ReasonDialog.Title"),
				model: this.getView().getModel("erp"),
				fnConfirm: function(oData) {
					this._oLocalModel.setProperty("/GoodsReceipt/PalettHt/key", oData.reason);
					this._oLocalModel.setProperty("/GoodsReceipt/PalettHt/OtherReason", oData.text);
				}.bind(this)
			}).open();
	    	

//	    	Helper.getReasonDialog({
//	    		initValue : this._oLocalModel.getProperty("/GoodsReceipt/PalettHt/text"),
//	    		source : oEvent.getSource(),
//	    		abort : function(oRadioGroup) {
////	    			oRadioButtons = oRadioGroup.getAggregation("buttons");
////	    			oRadioButtons[1].setSelected(false);
//	    		},
//	    		success : function(oRadioGroup, sReasonText) {
//	    			oRadioGroup.getModel("local").setProperty("/GoodsReceipt/PalettHt/text", sReasonText);
//	    		},
//	    		title : this._oI18nBundle.getText("Loading.ColliCntReasonTitle"),
//	    		text : this._oI18nBundle.getText("Loading.ColliCntReasonText")
//	    	}).open();
	    	
	    } else if (oRadioButtons[2].getSelected()){
	    	
	    	this._oLocalModel.setProperty("/GoodsReceipt/PalettHt/key", "");
	    	
	    	Helper.getReasonListDialog({
	    		bundle: oBundle,
	    		multiSelect: true,
				selectedKeys: this._oLocalModel.getProperty("/GoodsReceipt/PalettHt/keys"),
				initValue: this._oLocalModel.getProperty("/GoodsReceipt/PalettHt/OtherReason"),
				field: "03", // Feld: "Palette mit HT-Kennzeichnung", Siehe Definition Gründe: ZPHA_GR_REASONS
				title: oBundle.getText("ReasonDialog.Title"),
				model: this.getView().getModel("erp"),
				fnConfirm: function(oData) {
					this._oLocalModel.setProperty("/GoodsReceipt/PalettHt/keys", oData.reasons);
					this._oLocalModel.setProperty("/GoodsReceipt/PalettHt/OtherReason", oData.text);
				}.bind(this)
			}).open();
	    	
	    } else {
	    	this._oLocalModel.setProperty("/GoodsReceipt/PalettHt/text", "");
	    }
	    
	    if (oEvent.getParameter("selectedIndex") > -1){
	    	oEvent.getSource().setValueState("None");
	    }
	},
	
	onPressPalettHTExist: function(oEvent) {
		var oGroup = this.getView().byId("idPalettHTGroup");
		oGroup.fireEvent("select", { buttons: oGroup.getButtons()});
	},
	
	_getPlombReasonDialog : function(oContext) {

	    var that = this;
	    var sText;

	    if (!this._oPlombReasonDialog) {
	    var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
		
		var oListItem = new sap.m.StandardListItem({
		    //title : "{local>text}",			
		    title : "{erp>DdText}",
		    type : "Active",
		    press : function(oEvent) {			
		    	//var sText = oEvent.getSource().getTitle();
		    	var sKey = oEvent.getSource().getCustomData()[0].getKey();
		    	
		    	if (sKey == "9"){
		    		Helper.getReasonDialog({
		    			bundle: oBundle,
		   				source : oListItem,
		   				abort : function(oItem) {
		   					//oItem.getParent().setSelectedKey();
		   				}.bind(this),
		   				success : function(oItem, sReasonText) {
		   					this._oLocalModel.setProperty(oContext.reason, sReasonText);
		   				}.bind(this),
		   				title : this._oI18nBundle.getText("GoodsReceipt.PlombNumberReasonTitle"),
		   				text : this._oI18nBundle.getText("GoodsReceipt.PlombNumberReasonText")
		   			}).open();
		    	} 
		    	//that.getView().getModel("local").setProperty(oContext.property, sText);
		    	that.getView().getModel("local").setProperty(oContext.property, sKey);
		    	that._oPlombReasonDialog.close();
		    }.bind(this)
		});		
		
		
		oListItem.addCustomData(new sap.ui.core.CustomData({key:"{erp>DomValue}"}));

		this._oPlombReasonDialog = new sap.m.Dialog({
		    title : oContext.title,
		    type : 'Message',
		    content : [
		    	new sap.m.List({
		    		id: "idPlombReasonList",
		    		items : {
		    			path : oContext.reasons, // no curly brackets here!
		    			template : oListItem,
		    			templateShareable : false
		    		}		    		
		    	})
		    ],
		    endButton : new sap.m.Button({
		    	text : 'Abbrechen',
		    	press : function() {
		    		that.getView().getModel("local").setProperty(oContext.selectedProperty, false);
		    		that._oPlombReasonDialog.close();
		    	}
		    })
		});

		this.getView().addDependent(this._oPlombReasonDialog);	

	    }

	    return this._oPlombReasonDialog;
	},
	

	_getSerialNumberDialog : function() {
	    // create dialog lazily
	    if (!this._oSerialNumberDialog) {
		// create dialog via fragment factory
		this._oSerialNumberDialog = sap.ui.xmlfragment("idSerialNumberDialog",
			"de.arvato.GRModul01.fragment.SerialNumberDialog", this);
		// connect dialog to view (models, lifecycle)
		this.getView().addDependent(this._oSerialNumberDialog);
	    }

	    return this._oSerialNumberDialog;
	},
	
	onReasonRequested: function(oEvent) {
//		debugger;
		
//		var aFilters = [];
//		aFilters.push( new sap.ui.model.Filter("Field", sap.ui.model.FilterOperator.EQ, "02") );
//		oEvent.getSource().createFilterParams(aFilters);
	},
	
	onReasonReceived: function(oEvent) {
//		debugger;
	},
	
	onReasonChange: function(oEvent) {
//		debugger;
	},
	
	_getReasonDialog : function() {		
		
		if(!this._oReasonDialog){
			// create dialog via fragment factory
			this._oReasonDialog = sap.ui.xmlfragment("idReasonDialog",
					"de.arvato.GRModul01.fragment.ReasonDialog", this);
			
			// connect dialog to view (models, lifecycle)
			this.getView().addDependent(this._oReasonDialog);
		}

	    return this._oReasonDialog;
	},
	
	
	
	onSerialNumberDialogAccept : function(oEvent) {
	    this._getSerialNumberDialog().close();
	},

	onSerialNumberDialogAbort : function(oEvent) {
	    var oModel = this.getOwnerComponent().getModel("local");
	    oModel.setProperty("/GoodsReceipt/ExistTLog/SerialNumber", []);
	    oModel.setProperty("/GoodsReceipt/ExistTLog/yes", false);
	    oModel.setProperty("/GoodsReceipt/ExistTLog/no", true);
	    this._getSerialNumberDialog().close();
	},

	onSerialNumberScanSuccess : function(oEvent) {
	    
	    var sSerialNumber = oEvent.getParameter("text");
	    var oModel = this.getOwnerComponent().getModel("local");
	    oModel.setProperty("/GoodsReceipt/ExistTLog/Input", sSerialNumber);

	    var oInput = sap.ui.core.Fragment.byId("idSerialNumberDialog", "idSerialNumberInput");
	    oInput.fireSubmit({
		value : sSerialNumber
	    });
	},
	
	onSerialNumberInput : function(oEvent) {

	    var oInput = sap.ui.core.Fragment.byId("idSerialNumberDialog", "idSerialNumberInput");
	    oInput.fireSubmit({ 
		value: oInput.getValue()
	    });
	},

	onSerialNumberSubmit : function(oEvent) {

	    var oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

	    var oModel = this.getOwnerComponent().getModel("local");
	    var aSerialNumber = oModel.getProperty("/GoodsReceipt/ExistTLog/SerialNumbers");
	    var sSerialNumber = oEvent.getParameter("value");

	    var aExistSerialNumber = aSerialNumber.filter(function(value, index, arr) {
		// Krank, aber was solls, wenn es funktioniert?!
		return value.SerialNumber === sSerialNumber;
	    });

	    if (sSerialNumber === "") {
		MessageToast.show(oBundle.getText("SerialNumberDialog.NumberEmpty"));
	    }
	    else if (aExistSerialNumber.length > 0) {
		MessageToast.show(oBundle.getText("SerialNumberDialog.NumberExist", [
		    sSerialNumber
		]));
	    }
	    else {
		
		aSerialNumber.unshift({
		    "CheckId" : oModel.getProperty("/Loading1/CheckId"),
		    "SerialNumber" : sSerialNumber
		});
		oModel.refresh();

	    }

	    oEvent.getSource().setValue("");
	},

	onSerialNumberDelete : function(oEvent) {
	    var oList = oEvent.getSource(), oItem = oEvent.getParameter("listItem"), sPath = oItem.getBindingContext(
		    "local").getPath();

	    // after deletion put the focus back to the list
	    oList.attachEventOnce("updateFinished", oList.focus, oList);

	    var oModel = this.getOwnerComponent().getModel("local");
	    // send a delete request to the odata service

	    var aRest = oModel.getProperty("/GoodsReceipt/ExistTLog/SerialNumbers").filter(function(value, index, arr) {
		// Krank, aber was solls, wenn es funktioniert?!
		return value.SerialNumber !== oItem.getProperty("title");
	    });

	    oModel.setProperty("/GoodsReceipt/ExistTLog/SerialNumbers", aRest);
	},
	

    });
});
