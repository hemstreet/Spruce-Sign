Setup SPI Pins
== 

For WS2812 lights, for ws2801 lights checkout out the ws2801 branch

Follow the instructions, after reboot run `sudo raspi-config`, go to advanced options and enable SPI pins.

Once everything is up and running you can run `node script.js` to run the default allWhite or you can pass an argument to
the script like `node script.js roll` to run the roll command after its init'ed. this can be useful to run
`node script.js clear` to turn all of the lights off.

Config
===
Create file in `config/config.json` 

```
{
  "url" : "http://url.to.websocket.com"
}

```