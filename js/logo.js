var Logo = function () {
  var logo = $(".logo-dynamic")[0], logocon = logo.getContext("2d"),
      buffer1 = document.createElement("canvas"), bufcon1 = buffer1.getContext("2d"),
      buffer2 = document.createElement("canvas"), bufcon2 = buffer2.getContext("2d"),
      vw, vh, loop, count = 0,

      // Render loop
      rand = Math.random(),
      Logo = Object.create({
        resize, loop, loopGen () {
          let frameTiming = 1000/15;
          bufcon2.setTransform(-1, 0, 0, 1, 0, 0);
          return () => {
            performance.mark('startloop');

            // Update transform
            count++;
            var speed = .002, centre = .25 + .1 * rand;
            transform.set(.9, 0, 0, .9, vw/20, vh/20);
            transform.rotate(-count*speed, centre*vw, vh/2);

            let hvw = Math.floor(vw/2);
            logocon.fillStyle = "#000";
            logocon.fillRect(0, 0, vw, vh);
            logocon.transform.apply(logocon, transform.get());

            logocon.drawImage(buffer1, 0, 0, vw, vh);
            logocon.fillStyle = "#fff1";
            logocon.fillRect(0, 0, vw, vh);

            bufcon1.drawImage(logo, 0, 0, hvw, vh, 0, 0, hvw, vh);
            bufcon2.drawImage(logo, 0, 0, hvw, vh, 0, 0, -hvw, vh);
            bufcon1.drawImage(buffer2, 0, 0, hvw, vh, hvw, 0, hvw, vh);
            logocon.resetTransform();

            logocon.drawImage(buffer1, 0, 0, vw, vh);
            performance.mark('endloop');
            performance.measure('looptime', 'startloop', 'endloop');
            setTimeout(this.loop, Math.max(frameTiming - performance.getEntriesByName("looptime")[0].duration, 0));
            performance.clearMarks();
            performance.clearMeasures()
          }
        }
      }),

      // Transformer object
      transform = Object.create({
        get: function () { return this._t },
        set: function (...val) { return this._t = val },
        rotate: function (theta, x, y) {
          let s = Math.sin(theta), c = Math.cos(theta), t = this._t.slice(0), tx = t[4] - x, ty = t[5] - y;
          return this._t = [t[0]*c - t[1]*s, t[1]*c + t[0]*s, t[2]*c - t[3]*s, t[3]*c + t[2]*s, tx*c - ty*s + x, tx*s + ty*c + y];
        },
        scale: function (abs, x, y) {
          let t = this._t.slice(0);
          return this._t = [t[0]*abs, t[1]*abs, t[2]*abs, t[3]*abs, (t[4] - x)*abs + x, (t[5] - y)*abs + y]
        }
      });

  function resize (w, h) {
    'loop' in this && (this.loop = () => {});
    var img1 = new Image(logo.width, logo.height);
    img1.src = logo.toDataURL();
    var img2 = new Image(buffer1.width, buffer1.height);
    img2.src = buffer1.toDataURL();
    var img3 = new Image(buffer2.width, buffer2.height);
    img3.src = buffer2.toDataURL();
    logo.width = buffer1.width = buffer2.width = vw = (w || logo.clientWidth) * 2;
    logo.height = buffer1.height = buffer2.height = vh = (h || logo.clientHeight) * 2;
    return Promise.all([
      new Promise(resolve => img1.onload = () => resolve(logocon.drawImage(img1, 0, 0, vw, vh))),
      new Promise(resolve => img2.onload = () => resolve(bufcon1.drawImage(img2, 0, 0, vw, vh))),
      new Promise(resolve => img3.onload = () => resolve(bufcon2.drawImage(img3, 0, 0, vw, vh)))
    ]).then(() => 'loop' in this && (this.loop = this.loopGen())())
  }

  return resize().then(() => Logo);
}
