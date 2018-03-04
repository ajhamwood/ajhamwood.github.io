// Footer toy
var F = (function () {
  var F = Object.create({
    start (x, y) {
      resizeInner();
      F.play(x, y)
    },
    play (x, y) {
      if (x < 0 || x >= vw || y < 0 || y >= vh || gamestate[x][y] != 0) return false;
      var speed = 10;
      gamestate[x][y] = 1;
      score[0]++;
      skip(speed);
      var i, j, count = 0;
      while (count++ < 100000 && gamestate[i = Math.floor(vw * Math.random())][j = Math.floor(vh * Math.random())]);
      gamestate[i][j] = -1;
      score[1]++;
      skip(speed);
    }
  });
  var footer = $("#footer-toy")[0], fcontext = footer.getContext("2d"),
      vw, vh, gamestate, score;

  function skip (n) {
    var fdata = fcontext.getImageData(0, 0, vw, vh), buf = new ArrayBuffer(fdata.data.length),
        buf8 = new Uint8ClampedArray(buf), data = new Uint32Array(buf);
    for (let m = 0; m < n; m++) {
      let index = 0, g = Array(vw).fill(0).map(x => x = Array(vh).fill(0));
      for (let y = 0; y < vh; y++) for (let x = 0; x < vw; x++) {
        if (!(g[x][y] = gamestate[x][y])) {
          let t0 = x > 0 && gamestate[x-1][y], t1 = y < vh-1 && gamestate[x][y+1],
              t2 = x < vw-1 && gamestate[x+1][y], t3 = y > 0 && gamestate[x][y-1];
          if (t0 == 1 || t2 == 1) score[0] += (g[x][y] = 1);
          else if (t0 == -1 || t1 == -1 || t2 == -1 || t3 == -1) score[1] -= (g[x][y] = -1);
          else if (t1 == 1 || t3 == 1) score[0] += (g[x][y] = 1)
        }
        data[index++] = g[x][y] == 1 ? -1 : g[x][y] == -1 ? 255 << 24 : 0
      }
      gamestate = g;
      fdata.data.set(buf8);
      fcontext.putImageData(fdata, 0, 0);
      if (score[0] + score[1] == vw * vh) return finish(score[0], score[1])
    }
  }

  function finish (w, b) {
    $("#footer-right")[0].removeAttribute("data-active");
    $("#footer-right > div")[0].innerText = (Math.round(w * 1000 / vw / vh) / 10) + "% vs " +
      (Math.round(b * 1000 / vw / vh) / 10) + "%\n" + (w > b ? "White" : "Black") + " wins!"
  }

// Resize refresher
  function resizeInner () {
    footer.width = vw = footer.clientWidth;
    footer.height = vh = footer.clientHeight;
    gamestate = Array(vw).fill(0).map(x => x = Array(vh).fill(0));
    score = [0, 0];
    fcontext.putImageData(fcontext.createImageData(vw, vh), 0, 0)
  }
  function resize (e) { e.stopPropagation(); resizeInner() }
  resizeInner();
  $.addEvents({"": {resize}});

  return F
})()
