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
        $('#radarDiv').unbind('click');
        $("#radarDiv").click(World.clickedRadar);

        //setting photo swipe
        $('#showImages').unbind('click');
        $("#showImages").click(World.openPhotoSwipe);

		World.pointerList = [];

		World.pointerDrawable_idle = new AR.ImageResource("assets/pointer_idle.png");
		World.pointerDrawable_selected = new AR.ImageResource("assets/pointer_selected.png");
		World.pointerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		for (var i = 0; i < poiData.length; i++) {
			var singlePointer = {
				"id": poiData[i].id,
				"latitude": parseFloat(poiData[i].latitude),
				"longitude": parseFloat(poiData[i].longitude),
				"altitude": AR.CONST.UNKNOWN_ALTITUDE,
				"title": poiData[i].name,
				"description": poiData[i].description,
                "buildingName": poiData[i].buildingName,
                "thumbnailURL": poiData[i].thumbnailURL,
                "buildingImages": poiData[i].buildingImages
			};

			World.pointerList.push(new Pointer(singlePointer));
		}

        // updates distance information of all places
        World.preCalculatePointersDistance();

		World.updateStatusMessage(i + ' places loaded');
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
        $("#buildingName").html(pointer.ptrCoordinates.buildingName);
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

    showDetailsInAndroidActivity: function showDetailsInAndroidActivityFn() {

        var currentPointer = World.currentPointer;
        var pointerSelectedJSON = {
            action: "pointer_detailed_activity",
            id: currentPointer.ptrCoordinates.id,
            title: currentPointer.ptrCoordinates.title,
            description: currentPointer.ptrCoordinates.description
        };
        /*
         The sendJSONObject method can be used to send data from javascript to the native code.
         */
        AR.platform.sendJSONObject(pointerSelectedJSON);

    },

	// request data
	requestDataFromLocal: function requestDataFromLocalFn(lat, lon) {
		World.loadPointersFromJsonData(pointersData);
	},

    showLoader : function showLoaderFn() {

        var $this = $( this ),
            theme = $this.jqmData( "theme" ) || $.mobile.loader.prototype.options.theme,
            msgText = $this.jqmData( "msgtext" ) || $.mobile.loader.prototype.options.text,
            textVisible = $this.jqmData( "textvisible" ) || $.mobile.loader.prototype.options.textVisible,
            textonly = !!$this.jqmData( "textonly" );
        html = $this.jqmData( "html" ) || "";
        $.mobile.loading( 'show', {
            text: msgText,
            textVisible: textVisible,
            theme: theme,
            textonly: textonly,
            html: html
        });
    },

    hideLoader : function hideLoaderFn() {
        $.mobile.loading( "hide" );
    },

    //when user clicks on the radar, show him all the available buildings / markers
    clickedRadar: function clickedRadarFn() {
        // show panel
        var output = '';
        for (var i = 0; i < World.pointerList.length; i++) {
            output += ' <li><a href="javascript: World.onBuildingClickFromList(World.pointerList['+i+']);"><img src="'+World.pointerList[i].ptrCoordinates.thumbnailURL+'">'+World.pointerList[i].ptrCoordinates.title+'</a></li>';
        }

        $('#buildingDetailsLV').html(output).listview("refresh");
        $("#allPtrsListPanel").panel("open");
    },

    //when a user click on a building in all buildings list view panel at the left of screen
    onBuildingClickFromList: function onBuildingClickFromListFn(pointer) {
        World.onPointerSelected(pointer);
    },

    openPhotoSwipe: function openPhotoSwipeFn() {

        if(World.currentPointer.ptrCoordinates.buildingImages != undefined) {

            var currentPointer = World.currentPointer;
            // build items array
            var items = currentPointer.ptrCoordinates.buildingImages;

            var pswpElement = document.querySelectorAll('.pswp')[0];

            // define options (if needed)
            var options = {
                // history & focus options are disabled on CodePen
                history: false,
                focus: false,

                showAnimationDuration: 0,
                hideAnimationDuration: 0

            };

            var gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        } else {
            console.log("test");
            $.mobile.changePage('#noImgErrorDialog', 'pop', true, true);
        }
    }

};

AR.context.onLocationChanged = World.locationChanged;

//inactivate the pointer if it is in selected state and user taps on the screen
AR.context.onScreenClick = World.onScreenClick;