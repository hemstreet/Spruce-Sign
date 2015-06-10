var ws281x = require('rpi-ws281x-native'),
    _ = require('underscore'),
    socket = require('socket.io-client');

var sign = {

    totalLeds: 85,
    intervalDelay: 10000, // Time in milliseconds for interval delays to run
    rainbowSpeed: 250,
    pixelData: null,

    init: function () {

        this.pixelData = new Uint32Array(this.totalLeds);

        console.log('init with', this.totalLeds);
        ws281x.init(this.totalLeds);

        socket = socket('https://appointments.spruce.me');

        socket.on('connect', function () {
            console.log('connected');
        });

        socket.on('did-book-appointments', function () {
            this.rainbow();
        }.bind(this));

    },
    rainbow: function () {

        console.log('running rainbow');
        var offset = 0;

        var interval = setInterval(function () {
            _(this.totalLeds).times(function(i) {
                this.pixelData[i] = sign.colorWheel((offset + i) % 256);
            }.bind(this));

            offset = (offset + 1) % 256;
            this.update();
        }.bind(this), this.rainbowSpeed);

        setTimeout(function() {
            clearInterval(interval);
            this.defaultColor();
        }.bind(this), this.intervalDelay);


    },
    colorWheel: function (pos) {
        pos = 255 - pos;
        if (pos < 85) {
            return this.rgb2Int(255 - pos * 3, 0, pos * 3);
        }
        else if (pos < 170) {
            pos -= 85;
            return this.rgb2Int(0, pos * 3, 255 - pos * 3);
        }
        else {
            pos -= 170;
            return this.rgb2Int(pos * 3, 255 - pos * 3, 0);
        }
    },
    rgb2Int: function (r, g, b) {
        return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
    },
    // fill(r, g, b)
    // r, g, b: value as 0 - 255
    fill: function (r, g, b) {

        _(this.totalLeds).times(function(i) {

            this.pixelData[i] = this.rgb2Int(r,g,b);

        }.bind(this));

        this.update();
    },
    allWhite: function () {
        this.fill(255, 255, 255);
    },
    allBlue: function () {
        this.fill(0, 0, 255);
    },
    allRed: function () {
        this.fill(255, 0, 0);
    },
    allGreen: function () {
        this.fill(0, 255, 0);
    },
    defaultColor: function () {
        this.allWhite();
    },
    clear: function () {
        ws281x.reset();
    },
    update: function () {
        //console.log('in update', this.pixelData);
        ws281x.render(this.pixelData);
    }
};

sign.init();

// Do we have any custom commands to run?
var args = process.argv.slice(2);

if (args.length > 0) {

    // Make sure we are at our default state
    sign.defaultColor();

    // We have passed a custom command, lets make sure we call that
    setTimeout(function () {
        sign[args[0]]()
    }, 2500);

}
else {
    // Sign defaults to
    sign.defaultColor();
}
