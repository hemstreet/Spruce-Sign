Setup SPI Pins
== 
Follow the instructions, after reboot run `sudo raspi-config`, go to advanced options and enable SPI pins.

Once everything is up and running you can run `node script.js` to run the default allWhite or you can pass an argument to
the script like `node script.js roll` to run the roll command after its init'ed. this can be useful to run
`node script.js clear` to turn all of the lights off.

Node Cron
==
https://github.com/ncb000gt/node-cron