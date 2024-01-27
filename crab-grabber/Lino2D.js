class L2DJSWorld {
    constructor(options) {
        var self = this;
        this.initial_parameters = options;
        this.objects = options.objects || [];
        this.canvas = document.createElement('canvas');
        document.getElementById(options.screen_element_id).appendChild(this.canvas);
        this.hud_canvas = document.createElement('canvas');
        document.getElementById(options.hud_element_id).appendChild(this.hud_canvas);
        this.canvas.width = options.width || this.canvas.parentElement.width || 100;
        this.canvas.height = options.height || this.canvas.parentElement.height || 100;
        this.hud_canvas.width = this.canvas.width;
        this.hud_canvas.height = this.canvas.height;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.colision_matrix = JSON.parse(JSON.stringify(Array(this.height).fill(Array(this.width).fill(0))));
        this.context = this.canvas.getContext('2d');
        this.hud_context = this.hud_canvas.getContext('2d');
        this.context.fillStyle = options.bg_color || 'black';
        this.context.imageSmoothingEnabled = false;
        this.sprites_image = options.sprites_image;
        this.fps = options.fps || 30;
        this.fi = 0;
        this.translated_position = { x: 0, y: 0 };
        this.focused_position = this.translated_position;
        this.zoom_scale = options.zoom_scale || 1;
        this.context.scale(this.zoom_scale, this.zoom_scale);
        setInterval(function () { try { self.sortObjects(); } catch (e) { console.error(e); } }, 250);
        // setInterval(function () { try { self.updateColisionMatrix(); } catch (e) { console.error(e); } }, 500);
    };

    focusAt(position) {
        this.focused_position = position;
        this.translate((this.canvas.width / this.zoom_scale / 2 - position.x) - this.translated_position.x, (this.canvas.height / this.zoom_scale / 2 - position.y) - this.translated_position.y);
    }

    sortObjects() {
        this.objects = this.objects.sort(function (a, b) {
            return a.position.y != b.position.y ?
                (a.position.y >= b.position.y ? 1 : -1) :
                (a.order >= b.order ? 1 : -1);
        });
    }

    addObjects(objects) {
        var self = this;
        this.objects = this.objects.concat(objects);
        this.objects.forEach(function (object) {
            object.world = self;
        });
        this.sortObjects();
        this.updateColisionMatrix();
    }

    getObjectByName(name) {
        var search = this.objects.filter(function (object) {
            return object.name == name;
        });
        if (search.length) {
            return search[0];
        } else {
            return false;
        }
    }

    updateColisionMatrix() {
        var new_colision_matrix = JSON.parse(JSON.stringify(Array(this.height).fill(Array(this.width).fill(0))));
        this.objects.forEach(function (object) {
            if (object.fixed) object.contact_matrix.forEach(function (line, line_i) {
                line.forEach(function (cell, cell_i) {
                    try { new_colision_matrix[Math.round(object.position.y + object.contact_offset.y + line_i)][Math.round(object.position.x + object.contact_offset.x + cell_i)] += cell; } catch (e) { };
                });
            });
        });
        this.colision_matrix = new_colision_matrix;
    }

    startFraming(fps) {
        if (this.is_framing) return false; else this.is_framing = true;
        var self = this;
        var framing_function = function () {
            // self.context.fillRect(-self.canvas.width, -self.canvas.height, self.canvas.width * 3, self.canvas.height * 3);
            self.objects.filter(function (object) {
                return object.isVisible();
            }).forEach(function (object) {
                if (object.sprites.length) {
                    self.context.globalAlpha = object.sprite_opacity;
                    var anim_indexes = object.animation_indexes;
                    if (anim_indexes) {
                        var anim_index = anim_indexes[object.animation_state];
                        // object.cai = (object.cai + 1) % anim_index.length;
                        var sprite = object.sprites[anim_index[(object.cai + self.fi) % anim_index.length]];
                    } else {
                        var sprite = object.sprites[0];
                    }

                    if (sprite.name)
                        self.context.drawImage(self.sprites_image,
                            sprite.x, 
                            sprite.y, 
                            sprite.w, 
                            sprite.h, 
                            object.position.x + object.sprite_offset.x, 
                            object.position.y + object.sprite_offset.y, 
                            sprite.w, 
                            sprite.h
                            );
                    else
                        self.context.drawImage(sprite, object.position.x + object.sprite_offset.x, object.position.y + object.sprite_offset.y);
                    //context.drawImage(img, sx, sy, swidth, sheight, x, y, width, height);
                    // self.context.fillRect(object.position.x , object.position.y, 1, 1); // UNCOMMENT FOR DEBUG
                }
            });
            window.requestAnimationFrame(framing_function);
        };
        window.requestAnimationFrame(framing_function);
        this.framing_interval = setInterval(function () {
            self.fi++;
        }, 1000 / fps);
    }

    stopFraming() {
        clearInterval(this.framing_interval);
        this.is_framing = false;
    }

    translate(x_offset, y_offset) {
        this.translated_position = {
            x: this.translated_position.x + x_offset,
            y: this.translated_position.y + y_offset
        };
        this.context.translate(x_offset, y_offset);
    }

    setViewScale(new_scale) {
        this.context.reset();
        this.context.imageSmoothingEnabled = false;
        this.context.scale(new_scale, new_scale);
        this.context.translate(this.translated_position.x, this.translated_position.y);
        this.context.translate(
            (this.canvas.width / this.zoom_scale / 2 - this.focused_position.x) - this.translated_position.x,
            (this.canvas.height / this.zoom_scale / 2 - this.focused_position.y) - this.translated_position.y
        );
        this.zoom_scale = new_scale;
        this.context.fillStyle = this.initial_parameters.bg_color || 'black';
    }
}

class L2DJSObject {
    constructor(options) {
        this.mu = new MatrixUtilities();
        this.world;
        this.b_interval;
        this.name = options.name || '';
        this.always_render = options.always_render || false;
        this.cai = options.cai || 0;
        this.eci = options.eci || 0;
        this.animation_indexes = options.animation_indexes || null;
        this.animation_state = options.animation_state || null;
        this.order = options.order || 0;
        this.position = options.position || { x: 0, y: 0 };
        this.size = options.size || { w: 0, h: 0 };
        this.contact_matrix = options.contact_matrix || [[0]];
        this.fixed = options.fixed != undefined ? options.fixed : true;
        this.sprites = options.sprites ? [options.sprites].flat() : [];
        this.sprite_opacity = options.sprite_opacity || 1;
        this.sprite_offset = options.sprite_offset || { x: -this.size.w / 2, y: -this.size.h };
        this.contact_offset = options.contact_offset || { x: -this.contact_matrix[0].length / 2, y: - this.contact_matrix.length };
        this.behavior = options.behavior || []; // Array of functions, the function parameter is the current object
        this.executeBehavior(70);
    }

    translate(x_offset, y_offset, avoid_contact_with) {
        var new_position = {
            x: this.position.x + x_offset,
            y: this.position.y + y_offset
        }
        if (!this.hasPhysicalContact(new_position, avoid_contact_with)) {
            this.position = new_position;
            return true;
        } else {
            return false;
        }
    }


    hasPhysicalContact(position, object_name, full_contact) {
        var local_colision_matrix = this.mu.getSubMatrix(this.world.colision_matrix,
            Math.round(position.x + this.contact_offset.x),
            Math.round(position.y + this.contact_offset.y),
            Math.round(position.x + this.contact_offset.x + this.contact_matrix[0].length),
            Math.round(position.y + this.contact_offset.y + this.contact_matrix.length));

        if (!object_name) {
            return this.contact_matrix.some(function (line, line_i) {
                return line.some(function (cell, cell_i) {
                    return cell && local_colision_matrix[line_i][cell_i] > 0;
                });
            });
        } else {
            var target_object = this.world.getObjectByName(object_name);
            var intersected_matrix = this.mu.getSubMatrix(target_object.contact_matrix,
                position.x + this.contact_offset.x,
                position.y + this.contact_offset.y,
                position.x + this.contact_offset.x + this.contact_matrix[0].length,
                position.y + this.contact_offset.y + this.contact_matrix.length);
            if (full_contact) {
                return this.contact_matrix.every(function (line, line_index) {
                    return line.every(function (cell, cell_index) {
                        return (cell && intersected_matrix[line_index][cell_index]) || !cell;
                    });
                });
            }
            return this.contact_matrix.some(function (line, line_index) {
                return line.some(function (cell, cell_index) {
                    return cell && intersected_matrix[line_index][cell_index];
                });
            });
        }
    }

    isVisible() {
        return this.always_render ||
            (this.position.x - this.sprite_offset.x > this.world.focused_position.x - (this.world.canvas.width / this.world.zoom_scale) / 2 &&
                this.position.x + this.sprite_offset.x < this.world.focused_position.x + (this.world.canvas.width / this.world.zoom_scale) / 2 &&
                this.position.y - this.sprite_offset.y > this.world.focused_position.y - (this.world.canvas.height / this.world.zoom_scale) / 2 &&
                this.position.y + this.sprite_offset.y < this.world.focused_position.y + (this.world.canvas.height / this.world.zoom_scale) / 2);
    }

    getPositionRelatedData(position) {
        return {
            bigger_axis_distance: Math.max(Math.abs(position.x - this.position.x), Math.abs(position.y - this.position.y)),
            x_distance: Math.abs(position.x - this.position.x),
            y_distance: Math.abs(position.y - this.position.y),
            position_dir_x: Math.sign(position.x - this.position.x), // -1: left, 1: right
            position_dir_y: Math.sign(position.y - this.position.y), // -1: up, 1: down
        }
    }

    executeBehavior(freq) {
        if (this.b_interval) clearInterval(this.b_interval);
        var eci = this.eci; // execution current index
        var self = this;
        this.b_interval = setInterval(function () {
            if (world.paused) return;
            try {
                eci = (eci + 1) % self.behavior.length;
                if (self.behavior.length) {
                    self.behavior[eci](self);
                }
            } catch (e) {
                // console.log(e);
            }
        }, freq || 1000);
    }
}