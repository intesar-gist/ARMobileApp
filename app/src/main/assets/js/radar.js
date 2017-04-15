var PointersRadar = {

    hide: function hideFn() {
        AR.radar.enabled = false;
    },

    show: function initFn() {

        AR.radar.container = document.getElementById("radarDiv");

        // set the back-ground image for the radar
        AR.radar.background = new AR.ImageResource("assets/radar.png");
        AR.radar.northIndicator.image = new AR.ImageResource("assets/radar_north.png");

        // center of north indicator and radar-points in the radar asset, usually center of radar is
        // in the exact middle of the bakground, meaning 50% X and 50% Y axis --> 0.5 for centerX/centerY
        AR.radar.centerX = 0.5;
        AR.radar.centerY = 0.5;

        AR.radar.radius = 0.3;
        AR.radar.northIndicator.radius = 0.0;

        AR.radar.enabled = true;
    },

    updatePosition: function updatePositionFn() {
        if (AR.radar.enabled) {
            AR.radar.notifyUpdateRadarPosition();
        }
    }
};