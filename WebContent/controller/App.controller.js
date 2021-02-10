sap.ui.define([ "sap/ui/core/mvc/Controller", "sap/m/MessageToast" ], function(Controller, MessageToast) {
    "use strict";

    return Controller.extend("de.arvato.GRModul01.controller.App", {
    	onInit: function() {
    		// Bestimmt keine optimale Loesung!
    		// Sonst keine Moeglichkeit gefunden!
    		if (sap.ui.getCore().byId("shell")){
    			//
    			sap.ui.getCore().byId("shell").setHeaderHiding(false);
    		}
		}
    });
});