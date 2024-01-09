class WorldMap {
    MATRIX_UTILITIES = new MatrixUtilities();
    constructor(options) {
        options = options || {};
        this.position = { x: 0, y: 0 };
        this.bitmaps = {};
        this.seed_multiplier = 7;
        this.scale = options.scale || 1;
        this.color_palette = [
            '162e61ff',
            '162e61ff',
            '1a4071ff',
            '1e5685ff',
            '236c98ff',
            '267ea7ff',
            '2b96bcff',
            '38aac6ff',
            '74c3acff',
            'bce28dff',
            'f1e981ff',
            'f5ef9aff',
            '9afc39ff',
            '55eb14ff',
            '4ed812ff',
            '43bd0eff',
            '4f554fff',
            '5f5f5fff',
            '6f6f6fff'
        ];
        this.expandColorPalette(this.scale);
        this.width = options.width * this.scale;
        this.height = options.height * this.scale;
        this.matrix = options.matrix;
        this.canvas_element_id = options.canvas_element_id;
        this.seed = options.seed || Math.round(Math.random() * 1000);
        this.clusters = options.clusters || ((Math.round(Math.random() * 100) % 15) + 10) * this.scale;
        this.populating_iterations = options.populating_iterations || (20 * this.scale);
        this.initialize();
    }



    initialize() {
        try {
        } catch (e) {
            console.log(e);
        }
        if (!this.matrix) {
            this.matrix = JSON.parse(JSON.stringify(Array(this.width).fill(Array(this.height).fill(0))));
            this.generateMap();
        }
    }

    generateMap() {
        var self = this;
        this.setMapCluster(this.clusters);
        this.populateMapAltitude(this.width * this.height * this.populating_iterations);
        this.logMapDetails();
    }

    logMapDetails() {
        console.log('MAP GENERATION DETAILS');
        console.log('width:', this.width);
        console.log('height:', this.height);
        console.log('seed:', this.seed);
        console.log('clusters:', this.clusters);
        console.log('populating_iterations:', this.populating_iterations);
    }

    getRandomCoordinate(dimension) {
        return Math.floor(Math.random(0, 100) * dimension);
    }

    getSeededValue() {
        var padding = Math.round(this.width / 5);
        this.seed_multiplier = this.seed_multiplier > this.width ** 2 ? this.seed_multiplier / 10 : this.seed_multiplier * this.seed;
        return padding + (Math.round(this.seed_multiplier) % (this.width - padding * 2));
    }

    raiseAltitude(only_to_adjacents, x, y) {
        var x = x || this.getRandomCoordinate(this.width);
        var y = y || this.getRandomCoordinate(this.height);
        if (this.MATRIX_UTILITIES.hasAdjacentFilledCell(this.matrix, x, y) || !only_to_adjacents) {
            this.matrix[x][y] = this.matrix[x][y] < this.color_palette.length ?
                this.matrix[x][y] + 1 :
                this.color_palette.length - 1;
        }
    }

    setMapCluster(quantity) {
        while (quantity > 0) {
            this.raiseAltitude(false, this.getSeededValue(), this.getSeededValue());
            quantity--;
        }
    }


    populateMapAltitude(times) {
        while (times > 0) {
            this.raiseAltitude(true);
            times--;
        }
        this.matrix = this.MATRIX_UTILITIES.smoothCellValuesByNeighborhood(this.matrix, 7);
    }

    expandColorPalette(scale) {
        this.color_palette = this.color_palette.map(function (cell) {
            return Array(scale).fill(cell);
        }).reduce(function (a, b) { return a.concat(b) });
    }

}