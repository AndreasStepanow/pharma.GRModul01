sap.ui.define([
	"sap/ui/core/UIComponent", "sap/ui/Device", "sap/m/MessageBox", "de/arvato/GRModul01/model/models",
	"de/arvato/GRModul01/libs/Helper", "de/arvato/GRModul01/libs/Constants"
], function(UIComponent, Device, MessageBox, models, Helper, Constants) {
    "use strict";

    return UIComponent.extend("de.arvato.GRModul01.Component", {

	metadata : {
	    manifest : "json"
	},

	/**
	 * The component is initialized by UI5 automatically during the startup
	 * of the app and calls the init method once.
	 * 
	 * @public
	 * @override
	 */
	init : function() {

	    // call the base component's init function
	    UIComponent.prototype.init.apply(this, arguments);

	    // enable routing
	    this.getRouter().initialize();

	    // set the device model
	    this.setModel(models.createDeviceModel(), "device");
	    
	    this._oI18nBundle = this.getModel("i18n").getResourceBundle();

	    // sap.ui.getCore().getConfiguration().setLanguage("en-US");
	    // sap.ui.getCore().getMessageManager().registerObject(this, true);
	    
	    Constants.init(this);
	},
	
	goToSemanticObject(oData){
	    
	    if (sap.ushell) {

		this.oCrossAppNav = sap.ushell.Container.getService("CrossApplicationNavigation");
		this.oCrossAppNav.toExternal({
		    target : {
			semanticObject : oData.SemanticObject,
			action : oData.Action
		    },
		    params : oData.Parameters
		});
	    }
	    
	},
	
	_readEmployee : function(sIdent, fnSuccess) {

	    var oModel = this.getModel("local");
	    var oERPModel = this.getModel("erp");
	    var oBundle = this.getModel("i18n").getResourceBundle();

	    oModel.setProperty("/Employee/ID", sIdent);

	    // var sReadUrl = "/CheckSet('" + sInput + "')";
	    var sReadUrl = "/UserSet";

	    var oCmrRefFilter = new sap.ui.model.Filter({
		path : "Ident",
		operator : sap.ui.model.FilterOperator.EQ,
		value1 : sIdent
	    });

	    oERPModel.read(sReadUrl, {
		filters : [
		    oCmrRefFilter
		],
		success : function(oData, oResponse) {
		    var sName, sUser, sLgnum;

		    if (oData.results.length = 1) {
			var oResult = oData.results[0];
			if (oResult) {
			    sName = oResult.Address.Lastname + ", " + oResult.Address.Firstname;
			    sUser = oResult.Username;
			    sLgnum = oResult.Lgnum;
			}
			else {
			    sap.m.MessageToast.show(oBundle.getText("Main.EmployeeBarcodeMustBeScaned"), {
				at : "center center"
			    });
			}
		    }
		    else {
			sap.m.MessageToast.show(oBundle.getText("Main.EmployeeBarcodeMustBeScaned"), {
			    at : "center center"
			});
		    }

		    // Falls Ident nicht erkannt wurde, Wert auf undefined
		    // setzen!
		    oModel.setProperty("/Employee/Name", sName);
		    oModel.setProperty("/Employee/User", sUser);
		    oModel.setProperty("/Employee/Lgnum", sLgnum);		
		    oERPModel.setHeaders({ "lgnum": oModel.getProperty("/Employee/Lgnum") });
		    if (sName) {			
		    	fnSuccess();
		    }
		},
		error : function(oError) {
		    sap.m.MessageToast.show(Helper.getErrorValue(oError), {
			at : "center center"
		    });
		}
	    });
	},
	
	_readOpenChecks: function(sLgnum, fnSuccess){
		
		var oModel = this.getModel("local");
		var oERPModel = this.getModel("erp");
		var oBundle = this.getModel("i18n").getResourceBundle();
				
		oERPModel.read("/CheckSet", {
			filters: [				
				new sap.ui.model.Filter({ path: "Lgnum", operator: sap.ui.model.FilterOperator.EQ, value1: sLgnum }),
				new sap.ui.model.Filter({ path: "State", operator: sap.ui.model.FilterOperator.LT, value1: "20" })
			],
			success : function(oData, oResponse) {		
				fnSuccess(oData.results);
			}.bind(this),
			error : function(oError) {
				
			}
		});
	},
	
	_checkTime: function(oObject) {
		
		var oTimeOfOpening = this.getModel("local").getProperty("/Loading2/TimeOfOpening");
		var oTimeOfClosing = this.getModel("local").getProperty("/Loading2/TimeOfClosing");		
		
		if ( !oTimeOfOpening || !oTimeOfClosing ){
			return;
		}
		
		if (oTimeOfOpening.ms > oTimeOfClosing.ms){
			sap.m.MessageToast.show(this._oI18nBundle.getText("General.CloseTimeForOpenTime"), {
			    at : "center center"
			});
			oObject.SourcePicker.setValue("");
			oObject.SourcePicker.setValueState("Error");
		} else {
			oObject.SourcePicker.setValueState("None");
		}
	},

	_saveCheck : function(fnAfterSafe) {

	    var that = this;
	    var oBundle = this.getModel("i18n").getResourceBundle();
	    that._createCheck(fnAfterSafe);	
	},
	
	_getCheck: function() {
	    
	    var oLocalModel = this.getModel("local");
	    var oCheck = {};
	    
	    oCheck.State = oLocalModel.getProperty("/CmrRefState");	    
	    oCheck.CmrRef = oLocalModel.getProperty("/Loading1/CmrRef");
	    
	    if(oLocalModel.getProperty("/Loading1/CheckId")){
	    	oCheck.CheckId = oLocalModel.getProperty("/Loading1/CheckId");
	    }

	    if (oLocalModel.getProperty("/Loading1/CombinationGR/yes")) 
	    	oCheck.CombiGr = "1";
	    else if (oLocalModel.getProperty("/Loading1/CombinationGR/no"))
	    	oCheck.CombiGr = "0";
	    
	    
//	    if (!oLocalModel.getProperty("/Loading1/Erdat")) {
//	    	oLocalModel.setProperty("/Loading1/Erdat", new Date());
//	    }
//	    oCheck.Erdat = oLocalModel.getProperty("/Loading1/Erdat");
	    oCheck.Zgweno = oLocalModel.getProperty("/Loading1/RoughGR");
	    oCheck.Client = oLocalModel.getProperty("/Loading1/Client");

	    oCheck.Spedition = oLocalModel.getProperty("/Loading2/Spedition");
	    oCheck.VehicleReg = oLocalModel.getProperty("/Loading2/VehicleReg").toUpperCase();

	    var aKeys = oLocalModel.getProperty("/Loading1/TemperatureList");
	   	var iIndex = 0;
	    for (iIndex in aKeys){
	    	oCheck["Temperature" + iIndex] = aKeys[iIndex];
	    }	  
	    
//	    oCheck.Temperature = oLocalModel.getProperty("/Loading1/Temperature/key");
	    oCheck.TemperatureCom = oLocalModel.getProperty("/Loading1/Temperature/reasonText");

	    if (oLocalModel.getProperty("/Loading2/TimeOfOpening")) oCheck.TimeOfOpening = oLocalModel
		    .getProperty("/Loading2/TimeOfOpening");

	    if (oLocalModel.getProperty("/Loading2/TimeOfClosing")) oCheck.TimeOfClosing = oLocalModel
		    .getProperty("/Loading2/TimeOfClosing");

	    if (oLocalModel.getProperty("/GoodsReceipt/ExistCmr/yes")) 
	    	oCheck.ExistCmr = "1";
	    else if (oLocalModel.getProperty("/GoodsReceipt/ExistCmr/no"))
	    	oCheck.ExistCmr = "0";
	    
	    if (oLocalModel.getProperty("/GoodsReceipt/ExistTempPrint/yes")) 
	    	oCheck.ExistTempPrint = "1";
	    else if (oLocalModel.getProperty("/GoodsReceipt/ExistTempPrint/no"))
	    	oCheck.ExistTempPrint = "0";

	    if (oLocalModel.getProperty("/GoodsReceipt/ExistTLog/yes")) {
	    	oCheck.ExistTLog = "1";
	    	oCheck.ExistTLogCom = oLocalModel.getProperty("/GoodsReceipt/ExistTLog/reasonText");
	    	oCheck.LoggerSerialSet = oLocalModel.getProperty("/GoodsReceipt/ExistTLog/SerialNumbers");
	    } else if (oLocalModel.getProperty("/GoodsReceipt/ExistTLog/no")){
	    	oCheck.ExistTLog = "0";
	    }

	    if (oLocalModel.getProperty("/GoodsReceipt/ExistPlomb/yes")) {
	    	oCheck.ExistPlomb = "1";
	    } else if (oLocalModel.getProperty("/GoodsReceipt/ExistPlomb/no")){
	    	oCheck.ExistPlomb = "0";
	    	oCheck.ExistPlombCom = oLocalModel.getProperty("/GoodsReceipt/ExistPlomb/key");
	    	oCheck.ExistPlombOcom = oLocalModel.getProperty("/GoodsReceipt/ExistPlomb/OtherReason")
	    }

	    if (oLocalModel.getProperty("/GoodsReceipt/ExistColliCnt/yes")) {
	    	oCheck.ExistColliCnt = "1";
	    } else if (oLocalModel.getProperty("/GoodsReceipt/ExistColliCnt/no")){
	    	oCheck.ExistColliCnt = "0";
	    	oCheck.ExistColliCntCom = oLocalModel.getProperty("/GoodsReceipt/ExistColliCnt/text");
	    }
	    
	    if (oLocalModel.getProperty("/GoodsReceipt/ExistColliStt/yes")) {
	    	oCheck.ExistColliStt = "1";
	    } else if (oLocalModel.getProperty("/GoodsReceipt/ExistColliStt/no")){
	    	oCheck.ExistColliStt = "0";
	    	oCheck.ExistColliSttCom = oLocalModel.getProperty("/GoodsReceipt/ExistColliStt/key");
	    	oCheck.ExistColliStto = oLocalModel.getProperty("/GoodsReceipt/ExistColliStt/OtherReason");
	    }

	    if (oLocalModel.getProperty("/GoodsReceipt/PalettHt/yes")) {
	    	oCheck.PalettHt = "1";
	    }
	    else if (oLocalModel.getProperty("/GoodsReceipt/PalettHt/no")) {
	    	oCheck.PalettHt = "0";
	    	oCheck.PalettHtCom0 = oLocalModel.getProperty("/GoodsReceipt/PalettHt/key");
	    	oCheck.PalettHtOcom = oLocalModel.getProperty("/GoodsReceipt/PalettHt/OtherReason");
	    }
	    else if (oLocalModel.getProperty("/GoodsReceipt/PalettHt/mixed")) {
	    	oCheck.PalettHt = "2";	    	
	    	oCheck.PalettHtOcom = oLocalModel.getProperty("/GoodsReceipt/PalettHt/OtherReason");
	    	
	    	var aReasons = oLocalModel.getProperty("/GoodsReceipt/PalettHt/keys");
	    	var iIndex = 0;
	    	for(iIndex in aReasons){
	    		var sReason = aReasons[iIndex];
	    		oCheck["PalettHtCom" + iIndex] = sReason;
	    	}
	    }

	    oCheck.Commentar = oLocalModel.getProperty("/Signature/Comment");

	    // oCheck.Signature = oLocalModel.getProperty("/Signature/value");
	    oCheck.NameExtern= oLocalModel.getProperty("/Signature/NameExtern");
	    oCheck.NameIntern = oLocalModel.getProperty("/Employee/Name");	    
	    
	    return oCheck;
	},
	
	_setCheck: function( oCheck ) {
	    
	    var oLocalModel = this.getModel("local");
	    
	    var oFormatDate = sap.ui.core.format.DateFormat.getDateTimeInstance({
	    	pattern: "yyyy-MM-ddTHH:mm:ss"
	    });
	    	    
	    oLocalModel.setProperty("/CmrRefState", oCheck.State);
	    oLocalModel.setProperty("/Loading1/CmrRef", oCheck.CmrRef);	    
	    oLocalModel.setProperty("/Loading1/CheckId", oCheck.CheckId);
	    
	    oLocalModel.setProperty("/Loading1/CombinationGR/yes", oCheck.CombiGr == "1" ? true : false );
	    oLocalModel.setProperty("/Loading1/CombinationGR/no", oCheck.CombiGr == "0" ? true : false );
	    
	    //oLocalModel.setProperty("/Loading1/Erdat", oFormatDate.format(oCheck.Erdat));

	    oLocalModel.setProperty("/Loading1/RoughGR", oCheck.Zgweno);
	    oLocalModel.setProperty("/Loading1/Client", oCheck.Client);

	    oLocalModel.setProperty("/Loading2/Spedition", oCheck.Spedition);
	    oLocalModel.setProperty("/Loading2/VehicleReg", oCheck.VehicleReg);
	    
	    var iIndex = 0, aKeys = [];	   
	    var aKeysTemperature = [];
	    while(iIndex < 5){
	    	if (oCheck["Temperature" + iIndex]){
	    		aKeysTemperature.push(oCheck["Temperature" + iIndex]);
	    	}
	    	iIndex++;
	    }
	    oLocalModel.setProperty("/Loading1/TemperatureList", aKeysTemperature);
	    
//	    oLocalModel.setProperty("/Loading1/Temperature/key", oCheck.Temperature);
//	    oLocalModel.setProperty("/Loading1/Temperature/reasonText", oCheck.TemperatureCom);

	    if (oCheck.TimeOfOpening.ms > 0){
		oLocalModel.setProperty("/Loading2/TimeOfOpening", oCheck.TimeOfOpening);
	    }
	    
	    if (oCheck.TimeOfClosing.ms > 0){
		oLocalModel.setProperty("/Loading2/TimeOfClosing", oCheck.TimeOfClosing);
	    }

	    oLocalModel.setProperty("/GoodsReceipt/ExistCmr/yes", oCheck.ExistCmr == "1" ? true : false );
	    oLocalModel.setProperty("/GoodsReceipt/ExistCmr/no", oCheck.ExistCmr == "0" ? true : false );
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistTempPrint/yes", oCheck.ExistTempPrint == "1" ? true : false );
	    oLocalModel.setProperty("/GoodsReceipt/ExistTempPrint/no", oCheck.ExistTempPrint == "0" ? true : false );
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistTLog/yes", oCheck.ExistTLog == "1" ? true : false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistTLog/no", oCheck.ExistTLog == "0" ? true : false);
	    if (oCheck.ExistTLog == "1"){		
	    	
	    	oLocalModel.setProperty("/GoodsReceipt/ExistTLog/reasonText", oCheck.ExistTLogCom );
		
	    	var oERPModel = this.getModel("erp");
		
	    	var aSerialNumber = [];
	    	oCheck.LoggerSerialSet.__list.forEach(function(element) {
		    
	    		oERPModel.read("/" + element, {
	    			success : function(oData, oResponse) {
	    				aSerialNumber.unshift(oData);
	    			},
	    			error : function(oError) {
	    				
	    			}
	    		});
	    	});	
	    	oLocalModel.setProperty("/GoodsReceipt/ExistTLog/SerialNumbers", aSerialNumber );
		
		
		// oLocalModel.setProperty("/GoodsReceipt/ExistTLog/SerialNumbers",
		// oCheck.LoggerSerialSet);
	    }    

	    oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/yes", oCheck.ExistPlomb == "1" ? true : false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/no", oCheck.ExistPlomb == "0" ? true : false);
	    if (oCheck.ExistPlomb == "1"){	    	  
	    	oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/text", oCheck.ExistPlombCom);
	    }
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliCnt/yes", oCheck.ExistColliCnt == "1" ? true : false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliCnt/no", oCheck.ExistColliCnt == "0" ? true : false);
	    if (oCheck.ExistPlomb == "0"){	    	  
	    	oLocalModel.setProperty("/GoodsReceipt/ExistColliCnt/text", oCheck.ExistColliCntCom);
	    }
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/yes", oCheck.ExistColliStt == "1" ? true : false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/no", oCheck.ExistColliStt == "0" ? true : false);
	    if (oCheck.ExistPlomb == "0"){	    	  
	    	oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/text", oCheck.ExistColliSttCom);
	    }

	    switch (oCheck.PalettHt) {
	    	case "1":	
	    	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/yes", true);
	    	    break;
	    	case "0":
	    	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/no", true);
	    	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/key", oCheck.PalettHtCom0);
		    	oLocalModel.setProperty("/GoodsReceipt/PalettHt/OtherReason", oCheck.PalettHtOcom);
	    	    break;
	    	case "2":	 
	    	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/mixed", true);
	    	    iIndex = 0;  
	    	    var aKeysPalettHtCom = [];
	    	    while(iIndex < 5){
	    	    	if (oCheck["PalettHtCom" + iIndex]){
	    	    		aKeysPalettHtCom.push(oCheck["PalettHtCom" + iIndex]);
	    	    	}
	    	    	iIndex++;
	    	    }	    	    
	    	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/keys", aKeysPalettHtCom);
		    	oLocalModel.setProperty("/GoodsReceipt/PalettHt/OtherReason", oCheck.PalettHtOcom);
	    	    break;
	    	default:
	    	    break;
	    }	    
	    
	    oLocalModel.setProperty("/Signature/Comment", oCheck.Commentar);
	    
	    oLocalModel.setProperty("/Signature/NameExtern", oCheck.NameExtern);
	    oLocalModel.setProperty("/Employee/User", oCheck.NameIntern);	    

	},

	_createCheck : function(fnAfterCreate) {

	    var that = this;
	    var oBundle = this.getModel("i18n").getResourceBundle();
	    var oERPModel = this.getModel("erp");	   
	    var oCheck = this._getCheck();

// var mParameters = { groupId : "g01",
// success:function(oData, resp){
// fnAfterCreate(oData); },
// error: function(oData, resp) {
// console.log(resp); }};
	    
	    var sReadUrl = "/CheckSet";	   	    

// oERPModel.setUseBatch(true);
// oERPModel.setDeferredGroups(["g01"]);
	    
	    oERPModel.create(sReadUrl, oCheck, {
// groupId : "g01",
		success : function(oData, oResponse) {		   
		    // that.clearFormularData();
		    fnAfterCreate(oData);
		},
		error : function(oError) {
		    sap.m.MessageToast.show(Helper.getErrorValue(oError));
		}
	    });
	    
// oERPModel.submitChanges(mParameters);

	},
	
	_updateCheck: function(fnAfterUpdate) {
	    
	    var that = this;
	    var oBundle = this.getModel("i18n").getResourceBundle();
	    var oERPModel = this.getModel("erp");	   
	    var oCheck = this._getCheck();

	    var sPath = oERPModel.createKey("/CheckSet", {
			CheckId: oCheck.CheckId		  
	    	});

	    oERPModel.update(sPath, oCheck, {
		success : function(oData, oResponse) {		   
		    // that.clearFormularData();
		    fnAfterUpdate({});
		},
		error : function(oError) {
		    sap.m.MessageToast.show(Helper.getErrorValue(oError));
		}
	    });
	},
	
	
	_deleteCheck: function(oCheck, fnAfterUpdate) {

	    var that = this;
	    var oERPModel = this.getModel("erp");
	    
	    var sPath = oERPModel.createKey("/CheckSet", {
			CheckId: oCheck.CheckId		  
    		});
	    
	    oERPModel.remove(sPath, {
		    success: function(data) {
		    	fnAfterUpdate();
		    },
		    error: function(e) {
		     
		    }
		   });    
	    
	},

	clearFormularData : function(bFull) {

	    var oLocalModel = this.getModel("local");
	    
	    oLocalModel.setProperty("/CmrRefState", "00");    
	    oLocalModel.setProperty("/CmrRefCreated", false);
	    
	    oLocalModel.setProperty("/Loading1/CombinationGR/yes", false);
	    oLocalModel.setProperty("/Loading1/CombinationGR/no", false);	    
	    
	    oLocalModel.setProperty("/Loading1/CheckEditable", true);
	    oLocalModel.setProperty("/Loading1/CmrRef", "");
	    oLocalModel.setProperty("/Loading1/Zbetrst", "");	    
	    oLocalModel.setProperty("/Loading1/CheckId", "");	
	    oLocalModel.setProperty("/Loading1/Client", "");	
	    
	    oLocalModel.setProperty("/Loading1/Temperature", {});
	    oLocalModel.setProperty("/Loading1/TemperatureList", []);	  
	    
	    oLocalModel.setProperty("/Loading1/Erdat", "");
	    oLocalModel.setProperty("/Loading1/RoughGR", "");

	    oLocalModel.setProperty("/Loading2/Spedition", "");
	    oLocalModel.setProperty("/Loading2/VehicleReg", "");
	    oLocalModel.setProperty("/Loading2/TimeOfOpening");
	    oLocalModel.setProperty("/Loading2/TimeOfClosing");

	    oLocalModel.setProperty("/GoodsReceipt/ExistCmr/yes", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistCmr/no", false);
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistTempPrint/yes", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistTempPrint/no", false);
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistTLog/yes", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistTLog/no", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistTLog/SerialNumbers", []);
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/yes", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/no", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/text", "");
	    oLocalModel.setProperty("/GoodsReceipt/ExistPlomb/key", "");
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliCnt/yes", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliCnt/no", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliCnt/text", "");
	    
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/yes", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/no", false);
	    oLocalModel.setProperty("/GoodsReceipt/ExistColliStt/text", "");
	    
	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/yes", false);
	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/no", false);
	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/mixed", false);
	    oLocalModel.setProperty("/GoodsReceipt/PalettHt/text", "");

	    oLocalModel.setProperty("/Signature/Comment", "");
	    oLocalModel.setProperty("/Signature/NameExtern", "");
	}

    });
});
