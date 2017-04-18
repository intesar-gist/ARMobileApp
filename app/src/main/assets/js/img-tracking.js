/**
 * INTESAR HAIDER
 * matriulation # 147167
 *
 */
var ImgTracking = {
    loaded: false,

    createWwwButton: function createWwwButtonFn(url, size, options) {
        options.onClick = function() {
            AR.context.openInBrowser(url);
        };
        return new AR.ImageDrawable(this.imgButton, size, options);
    },

    init: function initFn() {

        this.targetCollectionResource = new AR.TargetCollectionResource("assets/tracking/tracker.wtc", {});

        this.tracker = new AR.ImageTracker(this.targetCollectionResource, {
            onError: function(errorMessage) {
                alert(errorMessage);
            }
        });

        this.imgButton = new AR.ImageResource("assets/tracking/wwwButton.jpg");

        //var imgOne = new AR.ImageResource("assets/tracking/imageOne.png");
        //var overlayOne = new AR.ImageDrawable(imgOne, 1, {
        //    translate: {
        //        x: -0.15
        //    }
        //});

        //var pageOneButton = this.createWwwButton("https://www.blue-tomato.com/en-US/products/?q=sup", 0.5, {
        //    translate: {
        //        x: -0.25,
        //        y: -0.25
        //    },
        //    zOrder: 1
        //});

        var weatherWidget = new AR.HtmlDrawable({
            uri: "assets/tracking/mensa.html"
        }, 1, {
            viewportWidth: 520,
            viewportHeight: 100,
            translate: { x: 0.36, y: 0.5 },
            horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.RIGHT,
            verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP,
            clickThroughEnabled: true,
            allowDocumentLocationChanges: false,
            onDocumentLocationChanged: function onDocumentLocationChangedFn(uri) {
                AR.context.openInBrowser(uri);
            }
        });

        var pageOne = new AR.ImageTrackable(this.tracker, "*", {
            drawables: {
                cam: [weatherWidget]
            },
            //onImageRecognized: someFunction,
            onError: function(errorMessage) {
                alert(errorMessage);
            },
            onImageRecognized: function (imgName) {
                console.log(imgName);
            }
        });

    }
};