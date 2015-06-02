var ws2801 = require('rpi-ws2801'),
    _ = require('underscore');

var sign = {

    totalLeds: 32,

    init: function () {

        console.log('Connecting', this.totalLeds);
        //ws2801.spiDevice = '/dev/spidev0.0';
        ws2801.numLEDs = 100;
        ws2801.connect(this.totalLeds);

    },
    //Create a pattern that is every other one
    //Acceptable values for each array are : 0 - 255
    //color: array[red, green, blue] e.g [255,0,0]
    dotted: function (colorOne, colorTwo) {
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
    roll: function() {
        console.log('Running Roll');
        _(this.totalLeds).times(function(i) {
            console.log('Setting Timeout', i);
            setTimeout(function() {
                console.log('Timeout', i);
                ws2801.setRGB(i, '#FF0000');
                ws2801.update();
            }, 1000 * i);
        });
    },
    runner: function () {

            var index = 0,
            i = 1,
            ri = 1,
            r = 0;

        setInterval(function () {

            ws2801.setColor(index, [r, 0, 255]);
            r += ri;
            index += i;
            ws2801.update();

            if (r >= 255 || r <= 0) {
                ri *= -1;
            }

            if (index >= this.totalLeds || index <= 0) {
                i *= -1;
            }
        }, 10);

    },
    // fill(r, g, b)
    // r, g, b: value as hex (0x00 = 0, 0xFF = 255, 0x7F = 127)
    fill: function (color1, color2, color3) {
        ws2801.fill(color1, color2, color3);
        this.update();
    },
    invert: function () {
        ws2801.invert();
    },
    clear: function () {
        ws2801.clear();
    },
    update: function () {
        ws2801.update();
    },
    disconnect: function () {
        ws2801.disconnect();
    }

};

sign.init();
sign.roll();
//sign.dotted([255,0,0], [0,0,255]);