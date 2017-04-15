var World = {

	initiallyLoadedData: false,

	// UI Assets for Pointers
	pointerDrawable_idle: null,
	pointerDrawable_selected: null,
	pointerDrawable_directionIndicator: null,

	// list of AR.GeoObjects that are visible on screen
	pointerList: [],

	// selected pointer
	currentPointer: null,

	loadPointersFromJsonData: function loadPoisFromJsonDataFn(poiData) {

        // show radar & set click-listener
        PointersRadar.show();

		World.pointerList = [];

		World.pointerDrawable_idle = new AR.ImageResource("assets/pointer_idle.png");
		World.pointerDrawable_selected = new AR.ImageResource("assets/pointer_selected.png");
		World.pointerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		for (var currentPlaceNr = 0; currentPlaceNr < poiData.length; currentPlaceNr++) {
			var singlePoi = {
				"id": poiData[currentPlaceNr].id,
				"latitude": parseFloat(poiData[currentPlaceNr].latitude),
				"longitude": parseFloat(poiData[currentPlaceNr].longitude),
				"altitude": AR.CONST.UNKNOWN_ALTITUDE,
				"title": poiData[currentPlaceNr].name,
				"description": "" //pointersData[currentPlaceNr].description
			};

			World.pointerList.push(new Pointer(singlePoi));
		}

        // updates distance information of all place marks
        World.preCalculatePointersDistance();

		World.updateStatusMessage(currentPlaceNr + ' places loaded');
	},

    // calculating distance while loading pointers
    preCalculatePointersDistance: function preCalculatePointersDistanceFn() {
        for (var i = 0; i < World.pointerList.length; i++) {
            World.pointerList[i].distanceToUser = World.pointerList[i].pointerObject.locations[0].distanceToUser();
        }
    },

    //shows the message once all the data is loaded
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function locationChangedFn(lat, lon, alt, acc) {

		if (!World.initiallyLoadedData) {
			World.requestDataFromLocal(lat, lon);
			World.initiallyLoadedData = true;
		}
	},

	onPointerSelected: function onPointerSelectedFn(pointer) {
		World.currentPointer = pointer;

        // update panel values
        $("#pointerTitle").html(pointer.ptrCoordinates.title);
        $("#pointerDescription").html(pointer.ptrCoordinates.description);

        //in-case distance wasn't calculated properly, re-calculate it
        if( undefined == pointer.distanceToUser ) {
            pointer.distanceToUser = pointer.pointerObject.locations[0].distanceToUser();
        }

        //calculating the unit of distance from user location to the pointer
        var distanceWithUnit = (pointer.distanceToUser > 999) ? ((pointer.distanceToUser / 1000).toFixed(2) + " km") : (Math.round(pointer.distanceToUser) + " m");
        $("#pointerDistance").html(distanceWithUnit);

        // show panel
        $("#pointerDataPanel").panel("open");

        //using jquery mobile 'panelbeforeclose' call back to deselect the selected pointer as well while closing panel
        $("#pointerDataPanel").on("panelbeforeclose", function(event, ui) {
            World.currentPointer.setDeselected(World.currentPointer);
        });

	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		if (World.currentPointer) {
			World.currentPointer.setDeselected(World.currentPointer);
		}
	},

	// request POI dat
	requestDataFromLocal: function requestDataFromLocalFn(lat, lon) {
		World.loadPointersFromJsonData(pointersData);
	}

};

AR.context.onLocationChanged = World.locationChanged;

//inactivate the pointer if it is in selected state and user taps on the screen
AR.context.onScreenClick = World.onScreenClick;