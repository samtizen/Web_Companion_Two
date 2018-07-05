/*
 * File: main.place-tracker.js
 * Project: ZGuide
 * File Created: Sunday, 1st July 2018 8:16:48 pm
 * Author: Sergei Papulin
 * -----
 * Last Modified: Thursday, 5th July 2018 2:53:39 pm
 * Modified By: Sergei Papulin
 * -----
 * Copyright 2018 Sergei Papulin, Zighter
 */

var stroller = (function($, serviceConsumer) {
     
    var mainTracker = {},
        stroll = null,
        pathItem = null,
        currentLocation;

    mainTracker.init = function(data) {

        // =====================================
        // DATA INIT
        // =====================================
        stroll = new Stroll();
        pathItem = new PathItem(); // for one path item
        stroll.addPathItem(pathItem);

        // Init test data

        // =====================================
        // UI INIT
        // =====================================


        // =====================================
        // EVENTS
        // =====================================
        // -------------------------------------
        // PAGES
        // -------------------------------------
        // Main Page
        $(".ui-start-tracker-btn").click(function() {
            // Start HAM
            startHAM();
            //pathItem = new PathItem(); // for multiple path items
            //stroll.addPathItem(pathItem);
        });
        $(".ui-text-input").focusin(function() {
            $(this).css("text-align", "left");
        });
        $(".ui-text-input").focusout(function() {
            $(this).css("text-align", "center");
        });
        
        // Guide Tracker Page
        $("#hsectionchanger").on("sectionchange", function(event) {
            console.log(event);
            if(event.originalEvent.detail.active === 1) {
                refreshPlaceDistanceList();
            }
        });
        // 1) Creator Section
        $(".add-place-btn").click(function() {
            // Open the place detail popup with empty form
            // TODO: Open loading indicator

            getCurrentLocation(function(location) {
                // TODO: close loading indicator
                // Get a current position and save it
                var point = {
                    lat: location.latitude,
                    lng: location.longitude
                }

                renderDetailPopupContent(point);
                tau.openPopup("#place-detail-popup-id");

            });

        });
        $(".ui-close-tracker-btn").click(function () {
            // Stop HAM
            stopHAM();
            // TODO: Save results
        });

        // 2) Place List Section
        $("#stroll").on("click", ".ui-place-item", function() {
            // Get the item id //var placeId = $(this).data("id");
            // TODO: open the place detail popup
            // renderPlaceDetailPopupContent(stroll.getPlaceById(placeId));
            // tau.openPopup("#place-detail-popup-id");
        });

        // -------------------------------------
        // POPUPS
        // -------------------------------------
        // Action Popup
        $(".back2main-btn").click(function(){
            // Close the action popup
            tau.closePopup("#action-options-popup-id");
        });
        $(".send-stroll-btn").click(function() {

            // Send the stroll to a device
            if (serviceConsumer.isBound() === false) serviceConsumer.init(JSON.stringify(stroll));
            else serviceConsumer.sendData(JSON.stringify(stroll));

            //return false;

        });
        $(".remove-stroll-btn").click(function() {
            // Remove the stroll
            stroll = new Stroll();
            pathItem = new PathItem(); // for one path item
            stroll.addPathItem(pathItem);
        });
        $("#action-selector-id").on("click", function(event) {
            var actionIndx = event.originalEvent.target.dataset.index;
            
            switch(actionIndx) {
                case "0": {
                    break;
                }
                case "1": {
                    if (serviceConsumer.isBound() === false) serviceConsumer.init(JSON.stringify(stroll));
                    else serviceConsumer.sendData(JSON.stringify(stroll));
                    break;
                }
                case "2": {
                    $(".remove-stroll-btn").trigger("click");
                }
            }
        });
        // Detail Popup
        $("#place-detail-popup-back-btn").click(function() {
            // TODO: Go back to the guide tracker page
            // tau.closePopup("#place-detail-popup-id");
        });
        $("#place-detail-popup-save-btn").click(function() {
            // TODO: save changes and go back to the guide tracker page
            var point = $("#place-detail-popup-id").data("location"),
                name = $("#place-detail-popup-id").find(".ui-text-input").val();
            
            var place = new Place({name: name, type: 1,  point: point});
            stroll.addPlace(place);
        });

        // Consent Popup
        $("#btn-load-popup-ok").click(function() {
        });
        $("#btn-load-popup-cancel").click(function() {
        });

    };

    // Start HumanActivityMonitor to track user GPS
    function startHAM() {

        console.log("Start HAM");

        var options = {
            "callbackInterval": 60000,
            "sampleInterval": 15000
        };

        // Check whether location feature is available 
        if (tizen.systeminfo.getCapability("http://tizen.org/feature/location.batch") === false) {
            console.log("GPS Location is not supported by this device");
            return;
        }
        // Start HAM GPS
        tizen.humanactivitymonitor.start("GPS", onChangedGPSCallback, onErrorGPSCallback, options);
        
        // HAM GPS -> Location changed
        function onChangedGPSCallback(locationPoints) {
            console.log(locationPoints);

            // Save point to path object
            var i = 0,
                lenPoints = locationPoints.gpsInfo.length;

            
            for(i; i < lenPoints; i++) {
                console.log(locationPoints.gpsInfo[i]);
                pathItem.addPoint(locationPoints.gpsInfo[i].latitude, locationPoints.gpsInfo[i].longitude)
            }

            if(lenPoints > 0) currentLocation = locationPoints.gpsInfo[lenPoints - 1];
        }
        // HAM GPS -> Failure
        function onErrorGPSCallback(error) {
            console.log(error);
        }


    }
    // Stop HumanActivityMonitor
    function stopHAM() {
        tizen.humanactivitymonitor.stop("GPS");
    }

    // Get the current position
    function getCurrentLocation(callbackSuccessFunc) {

        var options = {
            timeout: 15000,
            maximumAge: 0,
            enableHighAccuracy: true,
        };
        
        // Get the current location
        navigator.geolocation.getCurrentPosition(onSuccessCallback, onErrorCallback, options);

        // Get the current location -> Success
        function onSuccessCallback(locationPoint) {

            console.log(locationPoint);

            currentLocation = locationPoint.coords;

            if(callbackSuccessFunc) callbackSuccessFunc(locationPoint.coords);
        }
        // Get the current location -> Failure
        function onErrorCallback(error) {

            console.log(error);

            var message = "An unknown error occurred.";

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message = "User denied the request for Geolocation.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    message = "Location information is unavailable.";
                    break;
                case error.TIMEOUT:
                    message = "The request to get user location timed out.";
                    break;
                case error.UNKNOWN_ERROR:
                    message = "An unknown error occurred.";
                    break;
            }
            //renderInfoPopupText(message);
            //setStopStateTracker();
        }
    }
    // Refresh the list with places ordered by distance
    function refreshPlaceDistanceList() {

        // Ordered list by place distance
        var orderedList = stroll.getListOrderedByDistance(currentLocation);
        
        console.log(orderedList);

        // Render information on the watch screen
        renderPlaceListContent(orderedList);
    }

    // =====================================
    // UI RENDER
    // =====================================
    // -------------------------------------
    // PAGES
    // -------------------------------------
    // Main Page

    // Guide Tracker Page
    function renderPlaceListContent(places) {

        var htmlList = "",
            i = 0,
            lenPlaces = places.length;

        for(i; i < lenPlaces; i++) {

            htmlList += '<li class="li-has-multiline ui-place-item" data-id="' + places[i].id + '">' +
                            '<div class="list-name-container">' +
                                '<span class="name">' + places[i].name + '</span>' +
                            '</div>' +
                            '<span class="ui-li-sub-text li-text-sub">' + places[i].distance + ' m</span>' +
                        '</li>';
        }
        
        $(".ui-ordered-place-list").html(htmlList);

    }
    // -------------------------------------
    // POPUPS
    // -------------------------------------
    // Action Popup
        
    // Detail Popup
    function renderDetailPopupContent(place) {
        $("#place-detail-popup-id").data("location", place);
        $("#place-detail-popup-id").find(".ui-text-input").val("");
    }

    // Consent Popup

    return mainTracker;

})(jQuery, serviceConsumer);
