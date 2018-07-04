/*
 * File: service.sap.consumer.place-tracker.js
 * Project: ZGuide
 * File Created: Sunday, 1st July 2018 3:24:13 am
 * Author: Sergei Papulin
 * -----
 * Last Modified: Thursday, 5th July 2018 12:11:34 am
 * Modified By: Sergei Papulin
 * -----
 * Source: Samsung Accessory Protocol
 * -----
 * Copyright 2018 Sergei Papulin, Zighter
 */

var serviceConsumer = (function() {
	
	var serviceT = {},
		SAAgent = null,
		SASocket = null,
		CHANNELID = 105,
		strollStringJson = null,
		ProviderAppName = "ZGuideProvider";
	
	// STEP 6: Receive data from a remote device (Provider)
	function onReceive(channelId, data) {
		console.log(data);
	}

	// STEP 5: Send data to the Provider
	function sendData(data) {

		if (SASocket == null) return false;

		try {
			console.log(SASocket);
			SASocket.sendData(CHANNELID, data);
			return true;
		} catch(err) {
			console.log("exception [" + err.name + "] msg[" + err.message + "]");
			return false;
		}
	}

	// STEP 3.1: Set a listener
	var agentCallback = {

		// STEP 3.1 -> Connection was established
		onconnect : function(socket) {
	
			// Get socket for data transfer
			SASocket = socket;
	
			console.log("Connection established with Remote Peer");
			
			if (strollStringJson != null) sendData(strollStringJson);

			// STEP 4: Monitor the connection
			// 4.1: Set a listener for lost connection
			SASocket.setSocketStatusListener(onConnectionLost);
			// 4.2: Set a listener for data receiving
			SASocket.setDataReceiveListener(onReceive);
	
			function onConnectionLost(reason) {
				console.log("Service connection lost, Reason : [" + reason + "]");
				disconnect();
			}
		},
		// STEP 3.1 -> Failure
		onerror : function onerror(err) {
			console.log("err [" + err + "]");
		},
		onrequest : function(peerAgent){
			console.log("onrequest");
		},
	};

	// STEP 2.1: Set a Listener
	var peerAgentFindCallback = {
		onpeeragentfound : onPeerAgentFound,
		onpeeragentupdated : onPeerAgentUpdated,
		onerror : onPeerAgentFindError
	};
	// STEP 2.1 -> Remote Device is found
	function onPeerAgentFound(peerAgent) {
		try {
			if (peerAgent.appName == ProviderAppName) {
				// STEP 3: Set a connection
				// 3.1: Set a listener
				SAAgent.setServiceConnectionListener(agentCallback);
				// 3.2: Request a connection
				SAAgent.requestServiceConnection(peerAgent);
				
				console.log("");

			} else {
				console.log("Not expected app! : " + peerAgent.appName);
			}
		} catch(err) {
			console.log("exception [" + err.name + "] msg[" + err.message + "]");
		}
	}
	// STEP 2.1 -> Updated
	function onPeerAgentUpdated(peerAgent, status) {
		if(status == "AVAILABLE") {
		}
	}
	// STEP 2.1 -> Failure
	function onPeerAgentFindError(errorCode) {
		console.log("Error code : " + errorCode);
	}
	
	function disconnect() {
		try {
			if (SASocket != null) {
				SASocket.close();
				SASocket = null;
				console.log("closeConnection");
			}
		} catch(err) {
			console.log("exception [" + err.name + "] msg[" + err.message + "]");
		}
	}
	serviceT.init = function(stroll) {

		if(stroll != null) strollStringJson = stroll;

		try {
			// STEP 1: Request connection to the Remote Device
			webapis.sa.requestSAAgent(onSuccessRequest, onErrorRequest);
		} catch(error) {
			console.log("exception [" + error.name + "] msg[" + error.message + "]");
		}
	
		// STEP 1 -> Success
		function onSuccessRequest(agents) {
	
			try {
				if(agents.length > 0){
					SAAgent = agents[0];
					// STEP 2: Find Remote Device (Provider)
					// 2.1: Set a Listener
					SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
					// 2.2: Launch search
					SAAgent.findPeerAgents();
				} else {
					console.log("Not found SAAgent!");
				}
			} catch(err) {
				console.log("exception [" + error.name + "] msg[" + error.message + "]");
			}
		}
		// STEP 1 -> Failure
		function onErrorRequest(error) {
			console.log("err [" + error.name + "] msg[" + error.message + "]");
		}
	
	};

	serviceT.start = function() {
		
	};

	serviceT.stop = function() {

	};
	
	serviceT.sendData = function(data) {
		sendData(data);
	};
	serviceT.isBound = function() {
		if (SASocket != null) return true;
		return false;
	}

	return serviceT;
	
})();
