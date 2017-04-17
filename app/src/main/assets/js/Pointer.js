var visibilityAnimationDurationInMS = 500;
var resizeAnimationDurationInMS = 1000;

function Pointer(ptrCoordinates) {

    this.ptrCoordinates = ptrCoordinates;
    this.isSelected = false;

    this.animationGroup_idle = null;
    this.animationGroup_selected = null;

    // Pointer AR.GeoLocation
    var pointerLocation = new AR.GeoLocation(ptrCoordinates.latitude, ptrCoordinates.longitude, ptrCoordinates.altitude);

    // AR.ImageDrawable of pointer when it is in idle state
    this.pointerDrawable_idle = new AR.ImageDrawable(World.pointerDrawable_idle, 2.5, {
        zOrder: 0,
        opacity: 1.0,
        onClick: Pointer.prototype.getOnClickTrigger(this)
    });

    // AR.ImageDrawable of pointer when it is selected
    this.pointerDrawable_selected = new AR.ImageDrawable(World.pointerDrawable_selected, 2.5, {
        zOrder: 0,
        opacity: 0.0,
        onClick: null
    });

    // Pointer title AR.Label
    this.titleLabel = new AR.Label(ptrCoordinates.title.trunc(10), 1, {
        zOrder: 1,
        scale: 0.60,
        translate: {
            y: 0.45
        },
        style: {
            textColor: '#FFFFFF',
            fontStyle: AR.CONST.FONT_STYLE.BOLD
        }
    });

    //direction indicator image drawable
    this.directionIndicatorDrawable = new AR.ImageDrawable(World.pointerDrawable_directionIndicator, 0.1, {
        enabled: false,
        verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });

    this.radarCircle = new AR.Circle(0.03, {
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
        opacity: 0.8,
        style: {
            fillColor: "#ffffff"
        }
    });

    this.radarCircleSelected = new AR.Circle(0.05, {
        horizontalAnchor: AR.CONST.HORIZONTAL_ANCHOR.CENTER,
        opacity: 0.8,
        style: {
            fillColor: "#0066ff"
        }
    });

    this.radardrawables = [];
    this.radardrawables.push(this.radarCircle);

    this.radardrawablesSelected = [];
    this.radardrawablesSelected.push(this.radarCircleSelected);

    //Consolidate the pointer GeoLocation, idle and selected image drawables as well as direction indicator drawable
    this.pointerObject = new AR.GeoObject(pointerLocation, {
        drawables: {
            cam: [this.pointerDrawable_idle, this.pointerDrawable_selected, this.titleLabel],
            indicator: this.directionIndicatorDrawable,
            radar: this.radardrawables
        }
    });

    return this;
}

/**********************************************************************************************************************
 * Creating Pointer class prototypes functions below so that all the instances of this class can access these functions
 *********************************************************************************************************************/

Pointer.prototype.getOnClickTrigger = function(pointer) {
    return function() {

        if (!Pointer.prototype.isAnyAnimationRunning(pointer)) {
            if (pointer.isSelected) {

                Pointer.prototype.setDeselected(pointer);

            } else {
                Pointer.prototype.setSelected(pointer);
                try {
                    World.onPointerSelected(pointer);
                } catch (err) {
                    alert(err);
                }

            }
        } else {
            AR.logger.debug('a animation is already running');
        }
        return true;
    };
};

/**
 * Animations
 * @param pointer
 */
Pointer.prototype.setSelected = function(pointer) {

    pointer.isSelected = true;

    // New: 
    if (pointer.animationGroup_selected === null) {

        // create AR.PropertyAnimation to show / hide the idle and selected drawables
        var hideIdleDrawableAnimation = new AR.PropertyAnimation(pointer.pointerDrawable_idle, "opacity", null, 0.0, visibilityAnimationDurationInMS);
        var showSelectedDrawableAnimation = new AR.PropertyAnimation(pointer.pointerDrawable_selected, "opacity", null, 1.0, visibilityAnimationDurationInMS);

        // create AR.PropertyAnimation for all drawables that animates the scaling to 1.2
        var idleDrawableResizeAnimationX = new AR.PropertyAnimation(pointer.pointerDrawable_idle,
                            'scale.x',
                            null,
                            1.2,
                            resizeAnimationDurationInMS,
                            new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {amplitude: 2.0})
        );

        var selectedDrawableResizeAnimationX = new AR.PropertyAnimation(pointer.pointerDrawable_selected,
                            'scale.x',
                            null,
                            1.2,
                            resizeAnimationDurationInMS,
                            new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {amplitude: 2.0})
        );

        var titleLabelResizeAnimationX = new AR.PropertyAnimation(pointer.titleLabel,
                            'scale.x',
                            null,
                            0.45,
                            resizeAnimationDurationInMS,
                            new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {amplitude: 2.0})
        );

        var idleDrawableResizeAnimationY = new AR.PropertyAnimation(pointer.pointerDrawable_idle, 'scale.y', null, 1.2, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        var selectedDrawableResizeAnimationY = new AR.PropertyAnimation(pointer.pointerDrawable_selected, 'scale.y', null, 1.2, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        var titleLabelResizeAnimationY = new AR.PropertyAnimation(pointer.titleLabel, 'scale.y', null, 0.45, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        // add all the animations to the group that will run them
        pointer.animationGroup_selected = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [
                            hideIdleDrawableAnimation,
                            showSelectedDrawableAnimation,
                            idleDrawableResizeAnimationX,
                            selectedDrawableResizeAnimationX,
                            titleLabelResizeAnimationX,
                            idleDrawableResizeAnimationY,
                            selectedDrawableResizeAnimationY,
                            titleLabelResizeAnimationY
        ]);
    }

    pointer.pointerDrawable_idle.onClick = null;
    pointer.pointerDrawable_selected.onClick = Pointer.prototype.getOnClickTrigger(pointer);
    pointer.directionIndicatorDrawable.enabled = true;
    pointer.pointerObject.drawables.radar = pointer.radardrawablesSelected;

    // starts animation
    pointer.animationGroup_selected.start();
};

Pointer.prototype.setDeselected = function(pointer) {

    pointer.isSelected = false;
    pointer.pointerObject.drawables.radar = pointer.radardrawables;

    if (pointer.animationGroup_idle === null) {

        // create AR.PropertyAnimation that animates the opacity
        var showIdleDrawableAnimation = new AR.PropertyAnimation(pointer.pointerDrawable_idle, "opacity", null, 1.0, visibilityAnimationDurationInMS);
        var hideSelectedDrawableAnimation = new AR.PropertyAnimation(pointer.pointerDrawable_selected, "opacity", null, 0, visibilityAnimationDurationInMS);

        // create AR.PropertyAnimation that animates the scaling
        var idleDrawableResizeAnimationX = new AR.PropertyAnimation(pointer.pointerDrawable_idle, 'scale.x', null, 1.0, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        var selectedDrawableResizeAnimationX = new AR.PropertyAnimation(pointer.pointerDrawable_selected, 'scale.x', null, 1.0, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        var titleLabelResizeAnimationX = new AR.PropertyAnimation(pointer.titleLabel, 'scale.x', null, 0.60, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        var idleDrawableResizeAnimationY = new AR.PropertyAnimation(pointer.pointerDrawable_idle, 'scale.y', null, 1.0, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        var selectedDrawableResizeAnimationY = new AR.PropertyAnimation(pointer.pointerDrawable_selected, 'scale.y', null, 1.0, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        var titleLabelResizeAnimationY = new AR.PropertyAnimation(pointer.titleLabel, 'scale.y', null, 0.60, resizeAnimationDurationInMS, new AR.EasingCurve(AR.CONST.EASING_CURVE_TYPE.EASE_OUT_ELASTIC, {
            amplitude: 2.0
        }));

        pointer.animationGroup_idle = new AR.AnimationGroup(AR.CONST.ANIMATION_GROUP_TYPE.PARALLEL, [
                        showIdleDrawableAnimation,
                        hideSelectedDrawableAnimation,
                        idleDrawableResizeAnimationX,
                        selectedDrawableResizeAnimationX,
                        titleLabelResizeAnimationX,
                        idleDrawableResizeAnimationY,
                        selectedDrawableResizeAnimationY,
                        titleLabelResizeAnimationY
        ]);
    }

    pointer.pointerDrawable_idle.onClick = Pointer.prototype.getOnClickTrigger(pointer);
    pointer.pointerDrawable_selected.onClick = null;
    pointer.directionIndicatorDrawable.enabled = false;

    pointer.animationGroup_idle.start();
};

Pointer.prototype.isAnyAnimationRunning = function(pointer) {

    if (pointer.animationGroup_idle === null || pointer.animationGroup_selected === null) {
        return false;
    } else {
        if ((pointer.animationGroup_idle.isRunning() === true) || (pointer.animationGroup_selected.isRunning() === true)) {
            return true;
        } else {
            return false;
        }
    }
};

String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '...' : '');
};