sap.ui.define([ "sap/ui/model/json/JSONModel", "sap/ui/Device" ], function(JSONModel, Device) {
    "use strict";

    return {

	createDeviceModel : function() {
	    var oModel = new JSONModel(Device);
	    oModel.setDefaultBindingMode("OneWay");
	    return oModel;
	},

	createLocalModel : function() {
	    var oModel = new JSONModel("data/local.json");
	    oModel.setDefaultBindingMode("TwoWay");
	   
	    return oModel;
	}

    };
});