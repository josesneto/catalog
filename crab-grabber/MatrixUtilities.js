class MatrixUtilities {
    overrideMatrix(background_matrix, foreground_matrix, x_offset, y_offset) {
        x_offset = x_offset || 0;
        y_offset = y_offset || 0;
        return background_matrix.map(function (line, line_index) {
            return line.map(function (cell, cell_index) {
                // return foreground_matrix[line_index][cell_index] ? foreground_matrix[line_index][cell_index] : cell;
                return foreground_matrix[line_index - y_offset] ?
                    (foreground_matrix[line_index - y_offset][cell_index - x_offset] ? foreground_matrix[line_index - y_offset][cell_index - x_offset] : cell) :
                    cell;
            });
        })
    }
    transformMatrix(matrix, index_matrix, mirrored) {
        return index_matrix.map(function (item) {
            return matrix.flat()[item];
        }).map(function (item, item_index, self) {
            return mirrored ?
            self.slice(item_index * matrix[0].length, (item_index + 1) * matrix[0].length).reverse() :
            self.slice(item_index * matrix[0].length, (item_index + 1) * matrix[0].length);
        }).filter(function (item) { return item.length });
    }

    getMatrixSlice(matrix, x, y, slices) {
        return matrix.map(function (line) {
            return line.slice(x * (line.length / slices), (x * (line.length / slices)) + (line.length / slices));
        }).filter(function (line, line_index, self) { return line_index >= y * (self.length / slices) && line_index < (y + 1) * (self.length / slices); });
    }

    multiplyMatrixByInteger(matrix, integer) {
        return matrix.map(function (line) {
            return line.map(function (cell) {
                return cell ? integer : 0;
            });
        });
    }

    getSubMatrix(matrix, start_x, start_y, end_x, end_y) {
        return matrix.slice(start_y, end_y).map(function (line) { return line.slice(start_x, end_x); });
    }

    hasAdjacentFilledCell(matrix, x, y, observed_coordinate_counts) {
        var adjacent_increments = [-1, 0, 1];
        var matrix_width = matrix[0].length;
        var matrix_height = matrix.length;
        return adjacent_increments.some(function (i_increment) {
            return adjacent_increments.some(function (j_increment) {
                if (x + i_increment >= 0 && y + j_increment >= 0 &&
                    x + i_increment < matrix_height && y + j_increment < matrix_width &&
                    (observed_coordinate_counts || (!observed_coordinate_counts && j_increment != 0 && i_increment != 0))) {
                    return matrix[x + i_increment][y + j_increment];
                } else {
                    return false;
                }
            });
        });
    }

    getMeanValueOfAdjacentCells(matrix, x, y) {
        var adjacent_increments = [-1, 0, 1];
        var matrix_width = matrix[0].length;
        var matrix_height = matrix.length;
        return Math.round(adjacent_increments.map(function (i_increment) {
            return adjacent_increments.map(function (j_increment) {
                if (x + i_increment >= 0 && y + j_increment >= 0 && x + i_increment < matrix_height && y + j_increment < matrix_width) {
                    return matrix[x + i_increment][y + j_increment];
                } else {
                    return 0;
                }
            }).reduce(function (a, b) {
                return a + b;
            });
        }).reduce(function (a, b) {
            return a + b;
        }) / 9);
    }

    smoothCellValuesByNeighborhood(matrix, dept) {
        var self = this;
        if (!dept || dept > 0) {
            matrix.forEach(function (line, line_index) {
                line.forEach(function (item, item_index) {
                    var smoothed_altitude = self.getMeanValueOfAdjacentCells(matrix, line_index, item_index);
                    matrix[line_index][item_index] = smoothed_altitude;
                });
            });
            return this.smoothCellValuesByNeighborhood(matrix, --dept);
        } else {
            return matrix;
        }
    }

    scaleArray(array, scale) {
        return array.map(function(cell) {return Array(scale).fill(cell);}).flat();
    }
}