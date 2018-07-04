/*
 * File: main.tizen.js
 * Project: ZGuide
 * File Created: Friday, 29th June 2018 1:12:23 pm
 * Author: Sergei Papulin
 * -----
 * Last Modified: Thursday, 5th July 2018 12:11:26 am
 * Modified By: Sergei Papulin
 * -----
 * Copyright 2018 Sergei Papulin, Zighter
 */

(function() {
    $(window).on("tizenhwkey", function(event) {
        if (event.originalEvent.keyName === "back") {
            var $page = $(".ui-page-active"),
                pageId = $page ? $page.attr("id") : "";
                
            if (pageId === "main") {
                if ($("#action-options-popup-id").hasClass("ui-popup-active")) {
                    tau.closePopup("#action-options-popup-id");
                } else {
                    try {
                        tizen.application.getCurrentApplication().exit();
                    } catch (ignore) {}
                }
            } else {
                if (pageid !== "guide-tracker-page") window.history.back();
            }
        }
    });
})();