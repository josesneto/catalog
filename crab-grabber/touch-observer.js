drag_tolerance = 40;

touch_data = {
    current_touch: {
        x: null, y: null,
    },
    current_move: {
        x: null, y: null,
    },
    drag_offset: {
        x: null, y: null,
    },
    drag_orientation: {
        x: null, y: null,
    }
};

touchstart_event_fn = addEventListener('touchstart', function (e) {
    var current_touch = e.touches[0];
    touch_data.current_touch.x = current_touch.clientX;
    touch_data.current_touch.y = current_touch.clientY;
});
touchmove_event_fn = addEventListener('touchmove', function (e) {
    var current_move = e.touches[0];
    touch_data.current_move.x = current_move.clientX;
    touch_data.current_move.y = current_move.clientY;
    touch_data.drag_offset.x = touch_data.current_move.x - touch_data.current_touch.x;
    touch_data.drag_offset.y = touch_data.current_move.y - touch_data.current_touch.y;
    touch_data.drag_orientation.x = Math.abs(touch_data.drag_offset.x) > drag_tolerance ? Math.sign(touch_data.drag_offset.x) : 0;
    touch_data.drag_orientation.y = Math.abs(touch_data.drag_offset.y) > drag_tolerance ? Math.sign(touch_data.drag_offset.y) : 0;
});
touchend_event_fn = addEventListener('touchend', function (e) {
    Object.keys(touch_data).forEach(function (key) {
        touch_data[key] = { x: null, y: null };
    });
});
touchcancel_event_fn = addEventListener('touchcancel', function (e) {
    Object.keys(touch_data).forEach(function (key) {
        touch_data[key] = { x: null, y: null };
    });
});