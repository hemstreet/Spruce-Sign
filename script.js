var ws2801 = require('rpi-ws2801'),
    _ = require('underscore'),
    socket = require('socket.io-client');

var sign = {

    totalLeds: 75,
    loops: 2, // number of times to run the light loops i.e. for appointments booked
    currentLoop: 0,

    init: function () {

        socket = socket('https://appointments.spruce.me');

        console.log('Connecting', this.totalLeds);

        ws2801.connect(this.totalLeds);

        socket.on('connect', function(){
            console.log('connected');
        });

        socket.on('did-book-appointments', function(){
            console.log('did book appointments');
        });

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

        _(this.totalLeds).times(function(i) {
            setTimeout(function() {
                ws2801.setColor(i, [this.randomValue(), this.randomValue(), this.randomValue()]);
                ws2801.update();

                if(i == (this.totalLeds - 1)) {
                    if(this.currentLoop < this.loops) {
                        this.roll();
                    }
                    else
                    {
                        this.currentLoop = 0;
                        this.allWhite();
                    }
                }

            }.bind(this), 100 * i);
        }.bind(this));

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
        //this.update();
    },
    allWhite: function() {
        this.fill(255, 255, 255);
    },
    randomValue: function() {
        return Math.random() * (255 - 0) + 0;
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

// Do we have any custom commands to run?
var args = process.argv.slice(2);

if(args.length > 0) {
    // We have passed a custom command, lets make sure we call that
    sign[args[0]]()
}
else
{
    // Sign defaults to
    sign.allWhite();
}
