/// Header toy

var H = (function () {
  var header = $("#header-toy")[0], hcontext = header.getContext("2d"),
      buffer1 = document.createElement("canvas"), bufcon1 = buffer1.getContext("2d"),
      buffer2 = document.createElement("canvas"), bufcon2 = buffer2.getContext("2d"),
      vw, vh, count = 0;

// Render loop
  var H = Object.create({
    playstate: true, loop: () => {}, loopGen () {
      bufcon2.setTransform(-1, 0, 0, 1, 0, 0);
      hcontext.fillStyle = "#000";
      return () => {
        updateTransform();
        let hvw = Math.floor(vw/2);
        hcontext.fillRect(0, 0, vw, vh);
        hcontext.transform.apply(hcontext, transform.get());
        hcontext.filter = "url(#glow)";
        hcontext.drawImage(buffer1, 0, 0, vw, vh);
        hcontext.filter = "none";
        bufcon1.drawImage(header, 0, 0, hvw, vh, 0, 0, hvw, vh);
        bufcon2.drawImage(header, 0, 0, hvw, vh, 0, 0, -hvw, vh);
        bufcon1.drawImage(buffer2, 0, 0, hvw, vh, hvw, 0, hvw, vh);
        hcontext.resetTransform();
        hcontext.drawImage(buffer1, 0, 0, vw, vh);
        H.playstate && requestAnimationFrame(H.loop)
      }
    }
  });

  function updateTransform () {
    count++;
    var speed = .005, centre = .32 + .2*Math.cos(2*count*speed - .6/speed);
    transform.rotate(speed, centre*vw, vh/2);
    transform.scale(1 - speed*.18*Math.cos(count*speed - .3/speed), centre*vw, vh/2)
  }

// Transformer object
  function T (vw, vh) {
    this._t = [.9, 0, 0, .9, vw/20, vh/20]
  }

  T.prototype = {
    get: function () { return this._t },
    set: function (val) { return this._t = val },
    rotate: function (theta, x, y) {
      let s = Math.sin(theta), c = Math.cos(theta), t = this._t.slice(0), tx = t[4] - x, ty = t[5] - y;
      return this._t = [t[0]*c - t[1]*s, t[1]*c + t[0]*s, t[2]*c - t[3]*s, t[3]*c + t[2]*s, tx*c - ty*s + x, tx*s + ty*c + y];
    },
    scale: function (abs, x, y) {
      let t = this._t.slice(0);
      return this._t = [t[0]*abs, t[1]*abs, t[2]*abs, t[3]*abs, (t[4] - x)*abs + x, (t[5] - y)*abs + y]
    },
    constructor: T
  }

  var transform;

// Resize refresher
  function resizeInner () {
    H.playstate = $("header")[0].dataset.playstate == "play";
    var img1 = new Image(header.width, header.height);
    img1.src = header.toDataURL();
    var img2 = new Image(buffer1.width, buffer1.height);
    img2.src = buffer1.toDataURL();
    var img3 = new Image(buffer2.width, buffer2.height);
    img3.src = buffer2.toDataURL();
    header.width = buffer1.width = buffer2.width = vw = document.body.clientWidth;
    header.height = buffer1.height = buffer2.height = vh = .6 * window.innerHeight;
    var first = !!H.loop;
    loop = () => {};
    Promise.all([
      new Promise(resolve => img1.onload = () => resolve(hcontext.drawImage(img1, 0, 0))),
      new Promise(resolve => img2.onload = () => resolve(bufcon1.drawImage(img2, 0, 0))),
      new Promise(resolve => img3.onload = () => resolve(bufcon2.drawImage(img3, 0, 0)))
    ]).then(() => first && (H.loop = H.loopGen())());
    transform = new T(vw, vh);
  }
  function resize (e) { e.stopPropagation(); resizeInner() }
  resizeInner();
  $.addEvents({"": {resize}});

// Start render loop
  (H.loop = H.loopGen())();
  return H
})()
