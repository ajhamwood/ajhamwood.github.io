var Logo = function () {
  var logo = $(".logo-dynamic")[0], hcontext = logo.getContext("2d"),
      buffer1 = document.createElement("canvas"), bufcon1 = buffer1.getContext("2d"),
      buffer2 = document.createElement("canvas"), bufcon2 = buffer2.getContext("2d"),
      vw, vh, loop, count = 0;

// Render loop
  var Logo = Object.create({
    loop, loopGen () {
      let frameTiming = 1000/15;
      bufcon2.setTransform(-1, 0, 0, 1, 0, 0);
      hcontext.fillStyle = "#000";
      return () => {
        performance.mark('startloop');
        updateTransform();
        let hvw = Math.floor(vw/2);
        hcontext.fillRect(0, 0, vw, vh);
        hcontext.transform.apply(hcontext, transform.get());
        hcontext.filter = "url(#glow)";
        hcontext.drawImage(buffer1, 0, 0, vw, vh);
        hcontext.filter = "none";
        bufcon1.drawImage(logo, 0, 0, hvw, vh, 0, 0, hvw, vh);
        bufcon2.drawImage(logo, 0, 0, hvw, vh, 0, 0, -hvw, vh);
        bufcon1.drawImage(buffer2, 0, 0, hvw, vh, hvw, 0, hvw, vh);
        hcontext.resetTransform();
        hcontext.drawImage(buffer1, 0, 0, vw, vh);
        performance.mark('endloop');
        performance.measure('looptime', 'startloop', 'endloop');
        setTimeout(Logo.loop, Math.max(frameTiming - performance.getEntriesByName("looptime")[0].duration, 0));
        performance.clearMarks();
        performance.clearMeasures()
      }
    }
  });

  let rand = Math.random();
  function updateTransform () {
    count++;
    var speed = .002, centre = .25 + .1 * rand;
    transform.set(.9, 0, 0, .9, vw/20, vh/20);
    transform.rotate(-count*speed, centre*vw, vh/2);
  }

// Transformer object
  function T (vw, vh) {}

  T.prototype = {
    get: function () { return this._t },
    set: function (...val) { return this._t = val },
    rotate: function (theta, x, y) {
      let s = Math.sin(theta), c = Math.cos(theta), t = this._t.slice(0), tx = t[4] - x, ty = t[5] - y;
      return this._t = [t[0]*c - t[1]*s, t[1]*c + t[0]*s, t[2]*c - t[3]*s, t[3]*c + t[2]*s, tx*c - ty*s + x, tx*s + ty*c + y];
    },
    scale: function (abs, x, y) {
      let t = this._t.slice(0);
      return this._t = [t[0]*abs, t[1]*abs, t[2]*abs, t[3]*abs, (t[4] - x)*abs + x, (t[5] - y)*abs + y]
    },
    constructor: T
  };

  var transform;

  var img1 = new Image(logo.width, logo.height);
  img1.src = logo.toDataURL();
  var img2 = new Image(buffer1.width, buffer1.height);
  img2.src = buffer1.toDataURL();
  var img3 = new Image(buffer2.width, buffer2.height);
  img3.src = buffer2.toDataURL();
  logo.width = buffer1.width = buffer2.width = vw = logo.clientWidth * 2;
  logo.height = buffer1.height = buffer2.height = vh = logo.clientHeight * 2;
  return Promise.all([
    new Promise(resolve => img1.onload = () => resolve(hcontext.drawImage(img1, 0, 0))),
    new Promise(resolve => img2.onload = () => resolve(bufcon1.drawImage(img2, 0, 0))),
    new Promise(resolve => img3.onload = () => resolve(bufcon2.drawImage(img3, 0, 0)))
  ]).then(() => transform = new T(vw, vh)).then(() => Logo);
}