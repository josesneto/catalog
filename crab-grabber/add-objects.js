function addFlowers(n) {

    var flowers_t1 = new Array(n).fill(null);
    var flower_t1_sprites = [
        {name: 'flower1a', x: 72, y: 24, w: 12, h: 12},
        {name: 'flower1b', x: 84, y: 24, w: 12, h: 12},
        {name: 'flower1c', x: 96, y: 24, w: 12, h: 12},
    ];

    flower_coordinates = new Array(flowers_t1.length).fill(null).map(function (item) {
        do {
            var new_position = {
                x: w_map.getRandomCoordinate(w_map.width),
                y: w_map.getRandomCoordinate(w_map.height),
            };
            if (w_map.matrix[new_position.y][new_position.x] < 13 * w_map.scale ||
                w_map.matrix[new_position.y][new_position.x] > 15 * w_map.scale) {
                new_position = null;
            }
        } while (!new_position);
        return new_position;
    });
    flowers_t1 = flowers_t1.map(function (flower, f_index) {
        var flower = new L2DJSObject({
            name: 'flower t1o' + f_index,
            sprites: flower_t1_sprites,
            order: 1,
            animation_indexes: { default: mu.scaleArray([0, 1, 2, 2, 1, 0], dfs) },
            animation_state: 'default',
            position: flower_coordinates[f_index],
            size: { w: 12, h: 12 },
            cai: f_index * 5,
        });
        return flower;
    });
    world.addObjects(flowers_t1);
}

function addGrass(n) {
    var grass_t1 = new Array(n).fill(null);
    var grass_t1_sprites = [
        {name: 'grass1a', x: 108, y: 24, w: 12, h: 12},
        {name: 'grass1b', x: 120, y: 24, w: 12, h: 12},
        {name: 'grass1c', x: 132, y: 24, w: 12, h: 12},
    ];

    grass_coordinates = new Array(grass_t1.length).fill(null).map(function (item) {
        do {
            var new_position = {
                x: w_map.getRandomCoordinate(w_map.width),
                y: w_map.getRandomCoordinate(w_map.height),
            };
            if (w_map.matrix[new_position.y][new_position.x] < 12 * w_map.scale ||
                w_map.matrix[new_position.y][new_position.x] > 15 * w_map.scale) {
                new_position = null;
            }
        } while (!new_position);
        return new_position;
    });
    grass_t1 = grass_t1.map(function (grass, g_index) {
        var grass = new L2DJSObject({
            name: 'grass t1o' + g_index,
            sprites: grass_t1_sprites,
            order: 1,
            animation_indexes: { default: mu.scaleArray([0, 1, 2, 2, 1, 0], dfs) },
            animation_state: 'default',
            position: grass_coordinates[g_index],
            size: { w: 12, h: 12 },
            cai: g_index * 5,
        });
        return grass;
    });
    world.addObjects(grass_t1);
}

function addCrabs(n) {
    var crabs = new Array(n).fill(null);
    var crab_sprites = [
        {name: 'crab1a', x: 0, y: 24, w: 12, h: 12},
        {name: 'crab1b', x: 12, y: 24, w: 12, h: 12},
        {name: 'crab1c', x: 24, y: 24, w: 12, h: 12},
        {name: 'crab1d', x: 36, y: 24, w: 12, h: 12},
        {name: 'crab1e', x: 48, y: 24, w: 12, h: 12},
        {name: 'crab1f', x: 60, y: 24, w: 12, h: 12},
    ];

    crab_coordinates = new Array(crabs.length).fill(null).map(function (item) {
        do {
            var new_position = {
                x: w_map.getRandomCoordinate(w_map.width),
                y: w_map.getRandomCoordinate(w_map.height),
            };
            if (w_map.matrix[new_position.y][new_position.x] != 11 * w_map.scale) {
                new_position = null;
            }
        } while (!new_position);
        return new_position;
    });
    crabs = crabs.map(function (crab, c_index) {
        var crab = new L2DJSObject({
            name: 'crab t1o' + c_index,
            sprites: crab_sprites,
            order: 1,
            animation_indexes: { default: [5], spying: mu.scaleArray([0, 1], dfs * 6), walking: mu.scaleArray([2, 3, 4], dfs) },
            animation_state: 'default',
            contact_matrix: Array(12).fill(Array(12).fill(1)),
            position: crab_coordinates[c_index],
            size: { w: 12, h: 12 },
            behavior: crab_behavior,
            cai: c_index * 5,
            eci: c_index * 3,
            fixed: false,
        });
        return crab;
    });
    world.addObjects(crabs);
}

function addStones(space) {
    var stones = w_map.matrix.map(function (line, line_index) {
        return line.map(function (cell, cell_index) {
            return (line_index % space == 0 && cell_index % space == 0) && cell >= Math.round(16 * w_map.scale) ? (
                new L2DJSObject({
                    name: 'stone ' + line_index + ' ' + cell_index,
                    sprites: images['images/stones/stone' + Math.floor(Math.random() * 3) + '.png'],
                    order: 1,
                    animation_indexes: { default: [0] },
                    animation_state: 'default',
                    position: { x: cell_index, y: line_index },
                    size: { w: 12, h: 12 },
                })
            ) : null;
        }).filter(function (cell) { return cell; });
    }).filter(function (line) { return line.length; }).flat();

    console.log('stones', stones);
    world.addObjects(stones);
}

function addPalmTrees(n) {
    var palm_trees = new Array(n).fill(null);
    var palm_trees_sprites = [
        {name: 'palm-tree1a', x: 0, y: 36, w: 32, h: 32},
        {name: 'palm-tree1b', x: 32, y: 36, w: 32, h: 32},
        {name: 'palm-tree1c', x: 64, y: 36, w: 32, h: 32},
    ];

    var palm_trees_coordinates = new Array(palm_trees.length).fill(null).map(function (item) {
        do {
            var new_position = {
                x: w_map.getRandomCoordinate(w_map.width),
                y: w_map.getRandomCoordinate(w_map.height),
            };
            if (w_map.matrix[new_position.y][new_position.x] < 12 * w_map.scale ||
                w_map.matrix[new_position.y][new_position.x] > 16 * w_map.scale) {
                new_position = null;
            }
        } while (!new_position);
        return new_position;
    });
    palm_trees = palm_trees.map(function (palm_trees, pt_index) {
        var palm_tree = new L2DJSObject({
            name: 'palm tree t1o' + pt_index,
            sprites: palm_trees_sprites,
            order: 1,
            animation_indexes: { default: mu.scaleArray([0, 1, 2, 2, 1, 0], dfs * 2) },
            animation_state: 'default',
            contact_matrix: Array(2).fill(Array(5).fill(1)),
            contact_offset: { x: -3, y: -3 },
            position: palm_trees_coordinates[pt_index],
            size: { w: 32, h: 32 },
            cai: pt_index * 5,
        });
        return palm_tree;
    });
    world.addObjects(palm_trees);
}
function addBigPalmTrees(n) {
    var palm_trees = new Array(n).fill(null);
    var palm_trees_sprites = [
        {name: 'palm-tree2a', x: 0, y: 68, w: 64, h: 64},
        {name: 'palm-tree2b', x: 64, y: 68, w: 64, h: 64},
        {name: 'palm-tree2c', x: 128, y: 68, w: 64, h: 64},
    ];

    var palm_trees_coordinates = new Array(palm_trees.length).fill(null).map(function (item) {
        do {
            var new_position = {
                x: w_map.getRandomCoordinate(w_map.width),
                y: w_map.getRandomCoordinate(w_map.height),
            };
            if (w_map.matrix[new_position.y][new_position.x] < 12 * w_map.scale ||
                w_map.matrix[new_position.y][new_position.x] > 16 * w_map.scale) {
                new_position = null;
            }
        } while (!new_position);
        return new_position;
    });
    palm_trees = palm_trees.map(function (palm_trees, pt_index) {
        var palm_tree = new L2DJSObject({
            name: 'palm tree t1o' + pt_index,
            sprites: palm_trees_sprites,
            order: 1,
            animation_indexes: { default: mu.scaleArray([0, 1, 2, 2, 1, 0], dfs * 2) },
            animation_state: 'default',
            contact_matrix: Array(2).fill(Array(5).fill(1)),
            contact_offset: { x: -3, y: -3 },
            position: palm_trees_coordinates[pt_index],
            size: { w: 64, h: 64 },
            cai: pt_index * 5,
        });
        return palm_tree;
    });
    world.addObjects(palm_trees);
}