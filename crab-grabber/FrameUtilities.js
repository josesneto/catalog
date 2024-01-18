class FrameUtilities {
    getRGBPalette(palette) {
        return palette.map(function (item) {
            return [parseInt(item.slice(0, 2), 16), parseInt(item.slice(2, 4), 16), parseInt(item.slice(4, 6), 16), parseInt(item.slice(6, 8), 16)];
        });
    }



    getSprite(matrix, color_palette, callback) {
        try {
            var rgb_palette = this.getRGBPalette(color_palette);
            var clamped_arr = new Uint8ClampedArray(matrix.flat().map(function (item) {
                return rgb_palette[item];
            }).flat());
            // console.log(clamped_arr);
            var img_data = new ImageData(clamped_arr, matrix[0].length, matrix.length);
            // console.log(img_data);
            var promise = createImageBitmap(img_data);
            promise.then(callback);
        } catch (e) { }
    }
}