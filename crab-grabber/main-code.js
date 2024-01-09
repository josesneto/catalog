fu = new FrameUtilities();
mu = new MatrixUtilities();

images_to_be_loaded = [
    'images/logo.png',
    'images/char/char1.png',
    'images/char/char2.png',
    'images/char/char3.png',
    'images/char/char4.png',
    'images/char/char5.png',
    'images/char/schar1.png',
    'images/char/schar2.png',
    'images/char/schar3.png',
    'images/char/schar4.png',
    'images/char/schar5.png',
    'images/flowers/flower1a.png',
    'images/flowers/flower1b.png',
    'images/flowers/flower1c.png',
    'images/grass/grass1a.png',
    'images/grass/grass1b.png',
    'images/grass/grass1c.png',
    'images/stones/stone1.png',
    'images/stones/stone2.png',
    'images/stones/stone3.png',
    'images/crab/crab1a.png',
    'images/crab/crab1b.png',
    'images/crab/crab1c.png',
    'images/crab/crab1d.png',
    'images/crab/crab1e.png',
    'images/crab/crab1f.png',
    'images/palm-trees/palm-tree1a.png',
    'images/palm-trees/palm-tree1b.png',
    'images/palm-trees/palm-tree1c.png',
    'images/palm-trees/palm-tree2a.png',
    'images/palm-trees/palm-tree2b.png',
    'images/palm-trees/palm-tree2c.png',
];
images = {};
images_ready = false;
i = 0;

loadNextImage(i);

function loadNextImage(index) {
    console.log('i', index);
    var new_image = new Image();
    try {
        new_image.src = images_to_be_loaded[index];
        new_image.onload = function () {
            images[images_to_be_loaded[index]] = new_image;
            if (++index < images_to_be_loaded.length) loadNextImage(index); else main();
        };
    } catch (e) {
        // console.log(e);
        if (++index < images_to_be_loaded.length) loadNextImage(index); else main();
    }
}

function main() {
    console.log('images loaded', images);

    // var seed = prompt('seed:');

    dfs = 15; // default frame scale
    rto = 200; // run trigger offset

    scale_options = [7, 8, 10, 1];

    world = new L2DJSWorld({
        screen_element_id: 'screen',
        hud_element_id: 'screen-hud',
        width: window.innerWidth,
        height: window.innerHeight,
        zoom_scale: scale_options[0],
        bg_color: '#162e61ff'
    });

    map_generation_mode = 2;

    w_map_parameters = map_generation_mode == 1 ?
        {
            // SINGLE BIG ISLAND
            width: 250,
            height: 250,
            scale: 3,
            matrix: levels[0].matrix,
        } : {
            // // MANY LITTLE ISLANDS
            width: 400,
            height: 400,
            scale: 2,
            matrix: levels[2].matrix,
        }


    w_map = new WorldMap(w_map_parameters);

    water_level = 10 * w_map.scale;

    crabs_initial_quantity = 20;

    if (map_generation_mode == 1) {
        addFlowers(25);
        addGrass(150);
        // addStones(7);
        addCrabs(20);
        addPalmTrees(80);
        addBigPalmTrees(25);
    } else {
        addFlowers(25);
        addGrass(100);
        // addStones(6);
        addCrabs(20);
        addPalmTrees(30);
        addBigPalmTrees(10);
    }



    map = new L2DJSObject({
        name: 'world map',
        contact_matrix: w_map.contact_matrix,
        size: { w: 0, h: 0 },
        sprite_offset: { x: 0, y: 0 },
        always_render: true
    });

    fu.getSprite(w_map.matrix, w_map.color_palette, function (sprite) {
        map.sprites.push(sprite);
        world.addObjects(map);
        world.startFraming();
    });

    colision_matrix = w_map.matrix.map(function (line, line_index, matrix) {
        return line.map(function (cell, cell_index) {
            // return cell < 8 * w_map.scale || cell >= 16 * w_map.scale ? 1 : 0;
            return cell >= 16 * w_map.scale ||
                cell_index < 5 ||
                cell_index > line.length - 5 ||
                line_index < 5 ||
                line_index > matrix.length - 5
                ? 1 : 0;
        });
    });
    fu.getSprite(colision_matrix, ['00000000', '000000ff'], function (sprite) {
        col_map = new L2DJSObject({
            name: 'colision map',
            // sprites: [sprite],
            contact_matrix: colision_matrix,
            size: { w: w_map.width, h: w_map.height },
            sprite_offset: { x: 0, y: 0 },
            contact_offset: { x: 0, y: 0 },
        });
        world.addObjects(col_map);
    });



    sand_map_matrix = w_map.matrix.map(function (line) {
        return line.map(function (cell) {
            return cell < 12 * w_map.scale ? 1 : 0;
        });
    });
    fu.getSprite(sand_map_matrix, ['00000000', '0000ff88'], function (sprite) {
        col_map = new L2DJSObject({
            name: 'sand map',
            // sprites: [sprite],
            contact_matrix: sand_map_matrix,
            size: { w: w_map.width, h: w_map.height },
            sprite_offset: { x: 0, y: 0 },
            fixed: false
        });
        world.addObjects(col_map);
    });



    water_contact_matrix = w_map.matrix.map(function (line) {
        return line.map(function (cell) {
            return cell < water_level ? 1 : 0;
        });
    });

    water_sprite_1 = water_contact_matrix.map(function (line, line_index, self) {
        return line.map(function (cell, cell_index) {
            if (line_index > 0 && line_index < self.length - 1 && cell_index > 0 && cell_index < line.length - 1) {
                var neighbors_sum = mu.getSubMatrix(water_contact_matrix, cell_index - 1, line_index - 1, cell_index + 2, line_index + 2).flat().reduce(function (a, b) { return a + b });
                return cell && neighbors_sum < 9 ? 1 : 0;
            }
            return 0;
        });
    });

    water_sprite_2 = water_contact_matrix.map(function (line, line_index, self) {
        return line.map(function (cell, cell_index) {
            if (line_index > 0 && line_index < self.length - 1 && cell_index > 0 && cell_index < line.length - 1) {
                var neighbors_sum = mu.getSubMatrix(water_sprite_1, cell_index - 1, line_index - 1, cell_index + 2, line_index + 2).flat().reduce(function (a, b) { return a + b });
                return cell && !water_sprite_1[line_index][cell_index] && neighbors_sum > 1 ? 1 : 0;
            }
            return 0;
        });
    });

    water_sprite_3 = water_contact_matrix.map(function (line, line_index, self) {
        return line.map(function (cell, cell_index) {
            if (line_index > 0 && line_index < self.length - 1 && cell_index > 0 && cell_index < line.length - 1) {
                var neighbors_sum = mu.getSubMatrix(water_sprite_2, cell_index - 1, line_index - 1, cell_index + 2, line_index + 2).flat().reduce(function (a, b) { return a + b });
                return cell && !water_sprite_1[line_index][cell_index] && !water_sprite_2[line_index][cell_index] && neighbors_sum > 1 ? 1 : 0;
            }
            return 0;
        });
    });

    fu.getSprite([[0], [0]], ['00000000'], function (sprite_0) {
        fu.getSprite(water_sprite_1, ['00000000', 'ffffff66'], function (sprite_1) {
            fu.getSprite(water_sprite_2, ['00000000', 'ffffff44'], function (sprite_2) {
                fu.getSprite(water_sprite_3, ['00000000', 'ffffff22'], function (sprite_3) {
                    wr_map = new L2DJSObject({
                        name: 'water contact map',
                        sprites: [sprite_0, sprite_1, sprite_2, sprite_3],
                        animation_indexes: { default: mu.scaleArray([3, 2, 1, 2, 3, 0, 0, 0, 0, 0, 0], dfs * 2) },
                        animation_state: 'default',
                        contact_matrix: water_contact_matrix,
                        fixed: false,
                        size: { w: w_map.width, h: w_map.height },
                        sprite_offset: { x: 0, y: 0 },
                        always_render: true
                    });
                    world.addObjects(wr_map);
                });
            });
        });
    });

    pressed_keys = {};

    window.onkeydown = function (e) {
        pressed_keys[e.key.toUpperCase()] = true;
        if (e.key.toUpperCase() == 'C') world.setViewScale(scale_options[(scale_options.indexOf(world.zoom_scale) + 1) % scale_options.length]);
    }

    window.onkeyup = function (e) {
        pressed_keys[e.key.toUpperCase()] = false;
    }

    window.onblur = function (e) {
        Object.keys(pressed_keys).forEach(function (key) {
            pressed_keys[key] = false;
        });
    }

    console.log(world);

    setTimeout(function () {

        char_sprites = [
            images['images/char/char1.png'],
            images['images/char/char2.png'],
            images['images/char/char3.png'],
            images['images/char/char4.png'],
            images['images/char/char5.png'],
            images['images/char/schar1.png'],
            images['images/char/schar2.png'],
            images['images/char/schar3.png'],
            images['images/char/schar4.png'],
            images['images/char/schar5.png'],
        ];

        char_animation_indexes = {
            standing: mu.scaleArray([0, 1, 2, 1], dfs * 2),
            walking: mu.scaleArray([3, 4], dfs * 2),
            swimming: mu.scaleArray([5, 6, 7, 8, 9], dfs * 2),
        };

        char = new L2DJSObject({
            name: 'character',
            sprites: char_sprites,
            animation_indexes: char_animation_indexes,
            // sprite_opacity: 0.5,
            animation_state: 'standing',
            contact_matrix: Array(5).fill(Array(12).fill(1)),
            fixed: false,
            size: { w: 24, h: 24 },
        });

        world.addObjects(char);

        wave_sprites = [
            images['images/waves/waves1.png'],
            images['images/waves/waves2.png'],
            images['images/waves/waves3.png'],
            images['images/waves/waves4.png'],
            images['images/waves/waves5.png'],
        ];

        do {
            var new_position = {
                x: w_map.getSeededValue(),
                y: w_map.getSeededValue(),
            };
            var has_colision = char.hasPhysicalContact(new_position);
            var is_on_sand = char.hasPhysicalContact(new_position, 'sand map');
            var is_on_water = char.hasPhysicalContact(new_position, 'water contact map');
            console.log('has_colision', has_colision);
            if (!has_colision && is_on_sand && !is_on_water) {
                char.position = new_position;
            } else {
                new_position = null;
            }
        } while (!new_position);

        setInterval(function () {
            if (Object.keys(pressed_keys).some(function (k) { return pressed_keys[k] && k.startsWith('ARROW'); }) ||
                touch_data.drag_orientation.x || touch_data.drag_orientation.y) {
                char.animation_state = 'walking';
            }
            else char.animation_state = 'standing';
            world.focusAt({ x: char.position.x, y: char.position.y - 12 });
            if (pressed_keys['Z'] ||
                Math.abs(touch_data.drag_offset.x) > rto ||
                Math.abs(touch_data.drag_offset.y) > rto) vel = 2; else vel = 1;
            if (char.hasPhysicalContact(char.position, 'water contact map', true)) {
                char.animation_state = 'swimming';
                vel = 1;
            }
            offset_x = 0, offset_y = 0, offset_size = 1;


            if (pressed_keys['ArrowRight'.toUpperCase()]) offset_x = offset_size;
            if (pressed_keys['ArrowLeft'.toUpperCase()]) offset_x = -offset_size;
            if (pressed_keys['ArrowUp'.toUpperCase()]) offset_y = -offset_size;
            if (pressed_keys['ArrowDown'.toUpperCase()]) offset_y = offset_size;
            if (touch_data.drag_orientation.x) offset_x = touch_data.drag_orientation.x * offset_size;
            if (touch_data.drag_orientation.y) offset_y = touch_data.drag_orientation.y * offset_size;

            char.translate(offset_x * vel, offset_y * vel);
            if (offset_x || offset_y) world.sortObjects();

        }, 1000 / 20);
    }, 1);

    fu.getSprite(world.colision_matrix, ['00000000', '000000ff'], function (sprite) {
        col_map = new L2DJSObject({
            name: 'colision sprite debug',
            sprites: [sprite],
            contact_matrix: [[0]],
            size: { w: w_map.width, h: w_map.height },
            sprite_offset: { x: 0, y: 0 },
        });
        world.addObjects(col_map);
    });

    setInterval(renderHUD, 500);

    addEventListener('touchmove', function () {
        var ctx = world.hud_context;
        ctx.reset();
        ctx.strokeStyle = 'white';
        ctx.globalAlpha = 1;
        ctx.lineWidth = 20;
        ctx.beginPath();
        ctx.arc(touch_data.current_touch.x, touch_data.current_touch.y, 50, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.lineWidth = 120;
        ctx.moveTo(touch_data.current_touch.x, touch_data.current_touch.y);
        ctx.lineTo(touch_data.current_move.x, touch_data.current_move.y);
        ctx.closePath();
        ctx.globalCompositeOperation = "source-in";
        ctx.stroke();
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.lineWidth = 20;
        ctx.arc(touch_data.current_touch.x, touch_data.current_touch.y, 20, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.globalCompositeOperation = "destination-over";
        ctx.strokeStyle = 'white';
        ctx.stroke();
        renderHUD();
    });

    addEventListener('touchend', function (e) {
        world.hud_context.reset();
        renderHUD();
    });
    addEventListener('touchcancel', function (e) {
        world.hud_context.reset();
        renderHUD();
    });
}

function renderHUD() {
    var ctx = world.hud_context;
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = 1;
    ctx.drawImage(images['images/crab/crab1c.png'], 20, 10, 50, 50);
    ctx.clearRect(world.canvas.width - 100, world.canvas.height - 100, 100, 100);
    ctx.drawImage(images['images/logo.png'], world.canvas.width - 100, world.canvas.height - 100, 80, 80);
    ctx.font = "40px Monospace";
    var crabs_remaining_quantity = world.objects.filter(function (object) { return object.name.startsWith('crab'); }).length;
    ctx.clearRect(80, 0, 100, 60);
    ctx.fillText((crabs_initial_quantity - crabs_remaining_quantity) + "/" + crabs_initial_quantity, 90, 50);
}
