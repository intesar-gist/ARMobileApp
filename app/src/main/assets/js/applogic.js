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

	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

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

		World.updateStatusMessage(currentPlaceNr + ' places loaded');
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

		// deselect previous pointer
		if (World.currentPointer) {
			if (World.currentPointer.ptrCoordinates.id == pointer.ptrCoordinates.id) {
				return;
			}
			World.currentPointer.setDeselected(World.currentPointer);
		}

		// highlight current one
		pointer.setSelected(pointer);
		World.currentPointer = pointer;
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		if (World.currentPointer) {
			World.currentPointer.setDeselected(World.currentPointer);
		}
	},

	// request POI dat
	requestDataFromLocal: function requestDataFromLocalFn(lat, lon) {
		World.loadPoisFromJsonData(pointersData);
	}

};

AR.context.onLocationChanged = World.locationChanged;

//inactivate the pointer if it is in selected state and user taps on the screen
AR.context.onScreenClick = World.onScreenClick;