var ws2801 = require('rpi-ws2801'),
    _ = require('underscore');

var sign = {

    totalLeds: 150,

    init: function (leds) {

        this.totalLeds = leds;
        ws2801.connect(this.totalLeds);

        // Default fill to white
        ws2801.fill(255, 255, 255);

    },
    //Create a pattern that is every other one
    //Acceptable values for each array are : 0 - 255
    //color: array[red, green, blue] e.g [255,0,0]
    dotted: function (colorType, colorOne, colorTwo) {
        _.times(this.totalLeds, function (i) {
            if (i % 2 == 1) {
                ws2801.setColor(i, colorOne);
            }
            else {
                ws2801.setColor(i, colorTwo);
            }
        });
        this.update();

    },
    // fill(r, g, b)
    // r, g, b: value as hex (0x00 = 0, 0xFF = 255, 0x7F = 127)
    fill: function (color) {
        ws2801.fill(0xFF, 255, 0x00);
        this.update();
    },
    update: function () {
        ws2801.update();
    }

};

sign.init(60);