goog.provide('X.parserMAP');

goog.require('X.event');
goog.require('X.parser');
goog.require('X.triplets');
goog.require('X.colourmap');


/**
 * Create a parser for VTK colour maps (look-up tables).
 * 
 * @constructor
 * @extends X.parser
 */
X.parserMAP = function() {

    goog.base(this);

    /**
     * @inheritDoc
     * @const
     */
    this._classname = 'parserMAP';

};
// inherit from X.parser
goog.inherits(X.parserMAP, X.parser);


/**
 * @inheritDoc
 */
X.parserMAP.prototype.parse = function(container, object, data, flag) {

    X.TIMER(this._classname + '.parse');

    // Assign data
    this._data = data;

    // Scan data as an unsigned character array
    var bData = this.scan('uchar', this._data.byteLength);
    // Store the scanned array size
    var bLength = bData.length;

    // VTK colour map of n RGBA colours
    var colourMap = new Array(0);
    // Declare local variables
    var i, j, l, line, columns, offset, denom, min, max, del, sca;

    // Initialise starting offset and line number to 0
    offset = l = 0;

    for (i = 0; i < bLength; i++) {
        // Line break?
        if (bData[i] === 10 || i === bLength - 1) {
            var colour;

            // Fetch line
            if (i === bLength - 1) {
                line = this.parseChars(bData, offset, i + 1);
            } else {
                line = this.parseChars(bData, offset, i);
            }

            // Update starting offset
            offset = i + 1;
            // Update number of lines
            ++l;

            // Ignore first two lines
            if (l < 3)
                continue;

            // Trim whitespace
            line = line.replace(/^\s+|\s+$/g, '');
            // Split into columns
            columns = line.split(/\s+/);

            // Set the default colour as opaque black
            colour = [0.0, 0.0, 0.0, 1.0];

            // Convert string to float
            for (j = 0; j < columns.length; ++j) {
                colour[j] = parseFloat(columns[j]);
            }

            // Record row i+1 of colour map
            colourMap.push(colour);
        }
    }
    
    object._colourmap = new X.colourmap();
    object._colourmap.set(colourMap);
/*
    // Populate colour table (optional)
    for (i = 0; i < colourMap.length; ++i) {
        container.add(
                i / (colourMap.length - 1), i, colourMap[i][0], colourMap[i][1],
                colourMap[i][2], colourMap[i][3]
                );
    }
*/
    X.TIMERSTOP(this._classname + '.parse');

    // Commit changes
    var modifiedEvent = new X.event.ModifiedEvent();
    modifiedEvent._object = object;
    modifiedEvent._container = container;
    this.dispatchEvent(modifiedEvent);

};

goog.exportSymbol('X.parserMAP', X.parserMAP);
goog.exportSymbol('X.parserMAP.prototype.parse', X.parserMAP.prototype.parse);
