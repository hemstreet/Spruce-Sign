var ws281x = require('rpi-ws281x-native'),
    _ = require('underscore'),
    socket = require('socket.io-client'),
    crontab = require('node-crontab');

var sign = {

    totalLeds: 815,
    intervalRainbow: null,
    rainbowSpeed: 1,
    rainbowDuration: 30000, // Time in milliseconds for booked appointment to run
    pixelData: null,
    intervalCycle: null,
    intervalFade: null,
    currentColorIndex: 0,
    cycleDelay: 5000,
    colorFadeDuration: 1000,
    sunRiseHour : null,
    sunsetHour: null,
    colors : [
        [255,255,255],
        [255,0,0],
        [255,255,255],
        [0,0,255]
    ],
    config: require('./config/config.json'),

    init: function () {

        this.pixelData = new Uint32Array(this.totalLeds);

        ws281x.init(this.totalLeds);

        this.allGreen();

        socket = socket(this.config.url);

        socket.on('connect', function () {
            console.log('connected');
            this.cycleColors();
        }.bind(this));

        socket.on('did-book-appointments', function () {
            this.stop();
            this.rainbow();
        }.bind(this));

        var lat = 39.7392,
            lon = -104.9903;

        timers.setLocation(lat , lon);

        timers.sunset(this.defaultColor());
        timers.sunrise(this.stop());

    },
    isDay: function() {
        this.stop();
        this.allOff();
    },
    isNight: function() {
        this.defaultColor();
    },
    rainbow: function () {

        var offset = 0;

        var interval = setInterval(function () {

            _(this.totalLeds).times(function(i) {
                this.pixelData[i] = this.colorWheel((offset + i) % 256);
            }.bind(this));

            offset = (offset + 1) % 256;
            this.update();

        }.bind(this), this.rainbowSpeed);

        setTimeout(function() {
            this.stop();
            this.defaultColor();
        }.bind(this), this.rainbowDuration);

        this.intervalRainbow = interval;


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
    cycleColors : function() {

        //this.stop();
        this.rotateColor();

        this.intervalCycle = setInterval(function() {

            this.rotateColor();

        }.bind(this), this.cycleDelay);
    },

    rotateColor: function() {

        var start   = {},
            end     = {};

        start.r = this.colors[this.currentColorIndex][0];
        start.g = this.colors[this.currentColorIndex][1];
        start.b = this.colors[this.currentColorIndex][2];

        if(this.currentColorIndex >= (this.colors.length - 1)) {
            this.currentColorIndex = 0;
        } else {
            this.currentColorIndex++;
        }

        end.r = this.colors[this.currentColorIndex][0];
        end.g = this.colors[this.currentColorIndex][1];
        end.b = this.colors[this.currentColorIndex][2];

        this.fade(start, end, this.colorFadeDuration);

    },
    rgb2Int: function (r, g, b) {
        return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
    },
    // fill(r, g, b)
    // r, g, b: value as 0 - 255
    fill: function (r, g, b) {

        r = Math.abs(r);
        g = Math.abs(g);
        b = Math.abs(b);

        _(this.totalLeds).times(function(i) {

            this.pixelData[i] = this.rgb2Int(r,g,b);

        }.bind(this));

        this.update();
    },

    stop: function () {

        clearInterval(this.intervalCycle);
        clearInterval(this.intervalFade);
        clearInterval(this.intervalRainbow);

    },
    // linear interpolation between two values a and b
    // u controls amount of a/b and is in range [0.0,1.0]
    getInterpolation :function(a,b,u) {
        return (1-u) * a + u * b;
    },
    fade :function(start, end, duration) {
        var interval = 10,
            steps = duration/interval,
            step_u = 1.0/steps,
            u = 0.0,
            theInterval = setInterval(function(){
                if (u >= 1.0){ clearInterval(theInterval) }
                var r = parseInt(this.getInterpolation(start.r, end.r, u)),
                    g = parseInt(this.getInterpolation(start.g, end.g, u)),
                    b = parseInt(this.getInterpolation(start.b, end.b, u));
                this.fill(r,g,b);
                u += step_u;
            }.bind(this), interval);

        this.intervalFade = theInterval;

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
    allOff: function () {
        this.fill(0,0,0);
    },
    defaultColor: function () {
        this.cycleColors();
    },
    clear: function () {
        ws281x.reset();
    },
    update: function () {
        ws281x.render(this.pixelData);
    }
};

sign.init();

// Do we have any custom commands to run?
var args = process.argv.slice(2);

if (args.length > 0) {
    // We have passed a custom command, lets make sure we call that
    setTimeout(function () {
        sign.stop();
        sign[args[0]]()
    }.bind(this), 2500);
}