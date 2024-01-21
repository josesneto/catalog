var mu = new MatrixUtilities();
var crab_behavior = mu.scaleArray([
    function (self) { crabBehavior(self, -1, 0) },
    function (self) { crabBehavior(self, 1, 1) },
    function (self) { crabBehavior(self, -1, 0) },
    function (self) { crabBehavior(self, 1, 0) },
    function (self) { crabBehavior(self, -1, -1) },
    function (self) { crabBehavior(self, 0, 0) },
    function (self) { crabBehavior(self, 1, 0) },
    function (self) { crabBehavior(self, -1, 1) },
    function (self) { crabBehavior(self, 1, 0) },
    function (self) { crabBehavior(self, 0, 0) },
    function (self) { crabBehavior(self, -1, 0) },
    function (self) { crabBehavior(self, 1, -1) },
    function (self) { crabBehavior(self, -1, 0) },
    function (self) { crabBehavior(self, 1, 0) },
    function (self) { crabBehavior(self, 0, 0) },
], 20);


function crabBehavior(self, x_translate, y_translate) {
    var character = self.world.getObjectByName('character');
    var character_position_data = self.getPositionRelatedData(character.position);
    if (character_position_data.bigger_axis_distance >= 30 || !self.hasPhysicalContact(self.position, 'sand map', true)) {
        self.animation_state = 'walking';
        if (character_position_data.bigger_axis_distance <= 40 || self.alerted) {
            x_translate = -character_position_data.position_dir_x;
            y_translate = -character_position_data.position_dir_y;
            self.alerted = true;
            setTimeout(function () { self.alerted = false; }, 1000);
        }
        var new_position = { x: self.position.x + x_translate, y: self.position.y + y_translate };
        if (!self.hasPhysicalContact(new_position, 'water contact map', true)) {
            self.translate(x_translate, y_translate);
        }
    } else {
        if (character_position_data.bigger_axis_distance < 20) {
            self.animation_state = 'spying';
        }
        if (character_position_data.bigger_axis_distance < 10) {
            self.animation_state = 'default';
        }
    }
    if (self.animation_state == 'walking' && character_position_data.bigger_axis_distance < 10) {
        console.log(self.name);
        character.is_grabbing_crab = true;
        setTimeout(function() {character.is_grabbing_crab = false;}, 1000);
        self.world.objects = self.world.objects.filter(function (object) { return object.name != self.name; });
    }
}
