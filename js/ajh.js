function $ (sel, node) { return Array.prototype.slice.call( (node || document).querySelectorAll(sel) ) }

$.addEvents = function (obj, node) {
  for (var q in obj) for (var e in obj[q])
    for (var ns = q ? $(q, node) : [window, document], es = e.split(' '), i = 0; i < es.length; i++)
      typeof ns === 'undefined' || ns.forEach(n => n.addEventListener(es[i], obj[q][e].bind(n))) };


$.addEvents({
  "": {
    load: function () {}
  },
  "header": {
    click: function () {
      var state = ["pause", "play"], which = state.indexOf(this.dataset.playstate);
      H.playstate = this.dataset.playstate = state[1 - which];
      (H.loop = which ? () => {} : H.loopGen())()
    }
  },
  ".opt-list > span:not(.tbc)": {
    click: function () {
      $(".opt-list > [data-selected]").forEach(n => n.removeAttribute("data-selected"));
      $("#showcase > [data-selected]")[0].removeAttribute("data-selected");
      this.dataset.selected = "";
      $("#" + this.innerText)[0].dataset.selected = ""
    }
  },
  "#call-to-action img#phone": {
    mouseover: function () { $("#call-to-action img#email")[0].src = "img/phonenum.svg" },
    mouseout: function () { $("#call-to-action img#email")[0].src = "img/email.svg" }
  },
  "#call-to-action img#email": {
    mouseover: function () { $("#call-to-action img#phone")[0].src = "img/emailaddr.svg" },
    mouseout: function () { $("#call-to-action img#phone")[0].src = "img/phone.svg" }
  },
  "#footer-right": {
    click: function (e) {
      $("#footer-right > div")[0].innerText = "You are white";
      let {top, left} = this.getBoundingClientRect();
      if (this.hasAttribute("data-active")) F.play(e.layerX, e.layerY);
      else {
        F.start(e.clientX - Math.round(left), e.clientY - Math.round(top));
        this.dataset.active = ""
      }
    }
  }
})
