/**
 * INTESAR HAIDER
 * matriulation # 147167
 *
 */
var ImageGallery = {

    configurePhotoSwipe: function configurePhotoSwipeFn() {

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

            var gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        } else {
            $.mobile.changePage('#noImgErrorDialog', 'pop', true, true);
        }
    },

    init: function initFn() {
        $('#showImages').unbind('click');
        $("#showImages").click(ImageGallery.configurePhotoSwipe);
    }
};