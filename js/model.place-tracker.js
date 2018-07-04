/*
 * File: model.place-tracker.js
 * Project: ZGuide
 * File Created: Sunday, 1st July 2018 12:51:02 pm
 * Author: Sergei Papulin
 * -----
 * Last Modified: Thursday, 5th July 2018 12:11:30 am
 * Modified By: Sergei Papulin
 * -----
 * Copyright 2018 Sergei Papulin, Zighter
 */

var Place = (function() {

    function Place(place) {
        
        place = place || {};

        for (var name in Place.defaults) {
            if (place.hasOwnProperty(name)) this[name] = place[name];
            else this[name] = Place.defaults[name]
        }

        if (this.id == null) {
            this.id = new Date().valueOf().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
        }
    }

    Place.defaults = {
        id: null,
        type: null,
        name: null,
        description: null,
        point: {
            lat: null,
            lng: null
        },
    };

    return Place;

})();

var PathItem = (function() {

    function PathItem(pathItem) {
        
        pathItem = pathItem || {};

        for (var name in PathItem.defaults) {
            if (pathItem.hasOwnProperty(name)) this[name] = pathItem[name];
            else this[name] = PathItem.defaults[name]
        }
        if (this.id == null) {
            this.id = new Date().valueOf().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
        }
    }

    PathItem.defaults = {
        id: null,
        type: null,
        description: null,
        points: [],
        endpoints: []
    };

    PathItem.prototype.addPoint = function(lat, lng) {

        var point = {
            lat: lat,
            lng: lng
        };

        this.points.push(point);
    }

    return PathItem;
})();

var Stroll = (function() {

    function Stroll(stroll) {
        
        stroll = stroll || {};

        for (var name in Stroll.defaults) {
            if (stroll.hasOwnProperty(name)) this[name] = stroll[name];
            else this[name] = Stroll.defaults[name]
        }
    }

    Stroll.defaults = {
        name: null,
        path: [],
        places: []
    };
    
    // PLACES
    // Add
    Stroll.prototype.addPlace = function(place) {
        this.places.push(place);
    };
    // Update
    // Remove

    // PATH
    // Add
    Stroll.prototype.addPathItem = function(pathItem) {
        this.path.push(pathItem);
    };
    Stroll.prototype.addPoint2PathItem = function(indx, pathItem) {
        if (indx < this.path.length) this.path[indx].addPoint(lan, lng);
    };
    // Update
    // Remove

    Stroll.prototype.getById = function(placeId) {
        return _.findWhere(this.places, {id: String(placeId)});
    };
    Stroll.prototype.getListOrderedByDistance = function(currentPosition, useSeenOption) {
        this.sortedPlaces = _.map(this.places, function(place, indx, places) {
            var distance = geolib.getDistance(currentPosition, {latitude: place.point.lat, longitude: place.point.lng}); 
            return {"id": place.id, "name": place.name, "distance": distance };
        });
        return _.sortBy(this.sortedPlaces, "distance");
    };

    return Stroll;

})();