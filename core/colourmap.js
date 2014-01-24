goog.provide('X.colourmap');

goog.require('X.base');
goog.require('X.loadable');



/**
 * Create a container for a colourmap.
 *
 * @constructor
 * @extends X.base
 * @mixin X.loadable
 */
X.colourmap = function() {
  goog.base(this);

  /**
   * @inheritDoc
   * @const
   */
  this._classname = 'colourmap';

  /**
   * Array containing the mapping from scalar to colour.
   *
   * @type {!Array}
   * @protected
   */
  this._map = new Array();

  /**
   * Array containing the inverted mapping from scalar to colour.
   *
   * @type {!Array}
   * @protected
   */
  this._map = new Array();

  inject(this, new X.loadable());
};

goog.inherits(X.colourmap, X.base);

/**
 * Set colour map.
 *
 * @param {!Array} colourmap The mapping from scalar to colour.
 * 
 */
X.colourmap.prototype.set = function(colourmap) {
  var i;

  this._map = colourmap;

  this._invmap = new Array(this._map.length);
  for (i = 0; i < this._map.length; ++i) {
    this._invmap[this._map.length - 1 - i] = this._map[i];
  }
};

/**
 * Get colour map.
 *
 * @return {!Array} The mapping from scalar to colour.
 */
X.colourmap.prototype.get = function() {
  return this._map;
};

X.colourmap.prototype.convertScalarToColour = function(object, invert) {
  // Denominator for normalising colour table
  var denom = this._map.length - 1;
  var i, sca, min, max, del, col;

  // Initialise object object._colors
  object._colors = new X.triplets(object._scalars._glArray.length);
  
  // Has object._scalars?
  if (object._scalars !== null) {
    // Shift the scalar range so that the scalar range is 
    // [0, maxScalar - minScalar]
    var maxOffset = object._scalars._max - object._scalars._min;
    // Convert object._scalars to object._colors using the colour map.
    for (i = 0; i < object._scalars._glArray.length; i += 3) {
      col = new Array(3);
      // Normalise scalar to the desired range
      sca = (object._scalars._glArray[i] - object._scalars._min) / maxOffset;
      // Clamp scalar to the range [0, 1]
      if (sca > 1) {
        sca = 1;
      }
      if (sca < 0) {
        sca = 0;
      }
      // Update scalar
      object._scalars._glArray[i] = sca;
      // Inverted?
      if (invert) {
        min = this._invmap[Math.ceil(object._scalars._glArray[i] * denom)];
        max = this._invmap[Math.floor(object._scalars._glArray[i] * denom)];
      } else {
        min = this._map[Math.ceil(object._scalars._glArray[i] * denom)];
        max = this._map[Math.floor(object._scalars._glArray[i] * denom)];
      }
      // Linear interpolation
      del = [
        max[0] - min[0], max[1] - min[1],
        max[2] - min[2], max[3] - min[3]
      ];
      col[0] = min[0] + del[0] * (sca - min[0]);
      col[1] = min[1] + del[1] * (sca - min[1]);
      col[2] = min[2] + del[2] * (sca - min[2]);
      object._colors.add(col[0], col[1], col[2]);
    }

    object._scalars._min = 0.0;
    object._scalars._max = 1.0;
  }
};

goog.exportSymbol('X.colourmap', X.colourmap);
goog.exportSymbol('X.colourmap.prototype.get', X.colourmap.prototype.get);
goog.exportSymbol('X.colourmap.prototype.convertScalarToColour', X.colourmap.prototype.convertScalarToColour);
