// Utilities

function $ (sel, node) { return Array.prototype.slice.call( (node || document).querySelectorAll(sel) ) }

$.addEvents = function (obj, node) {
  for (var q in obj) for (var e in obj[q])
    for (var ns = q ? $(q, node) : [window, document], es = e.split(' '), i = 0; i < es.length; i++)
      typeof ns === 'undefined' || ns.forEach(n => n.addEventListener(es[i], obj[q][e].bind(n))) };

$.Machine = function (s) {
  let events = [], state = Object.seal(s);
  return Object.assign(this, {
    getState () { return state },
    on (event, fn) { (events[event] = events[event] || []).push(fn); return this },
    emit (event, ...args) { return events[event] && events[event].reduce((s, fn) => (fn.apply(s, args), s), state) },
    stop (event, fname = '') { events[event] && events[event].splice(events[event].findIndex(fn => fn.name == fname), 1); return this } }) };


// Page functions

function rem (val) { return val * parseFloat(getComputedStyle(document.documentElement).fontSize) }

function lerp (a, b, t) { return t * a + (1 - t) * b }

function redrawHeader (offset, val) {
  let header = $('header')[0], headerlogo = $('header > .logo')[0], headername = $('header > .name')[0], nav = $('nav')[0],
      { height, width } = machine.getState().screen, remWidth = width / rem(1);
  header.style.height = lerp(12, 3, val) + 'rem';
  header.style.padding = [[rem(2), rem(1)], [0, rem(1)], [0, rem(1)], [remWidth < 78 ? rem(3) : width * .55 - rem(40), rem(1)]]
    .map(ar => lerp.apply(null, ar.concat(val)) + 'px').join(' ');
  header.style.width = lerp(remWidth < 78 ? width - rem(3) : width * .45 + rem(40), width - rem(2), val) + 'px';
  header.style.background = '#000' + (1 - val ? 'f' : '0');
  headerlogo.style.width = headerlogo.style.minWidth = lerp(40/3, 5, val) + 'rem';
  headerlogo.style.height = headerlogo.style.minHeight = lerp(8, 3, val) + 'rem';
  headername.style.fontSize = lerp(3.2, 1.2, val) + 'rem';
  nav.style.opacity = remWidth < 47 ? Math.floor(1 - val) : 1 - val;
  nav.style.zIndex = Math.ceil(1 - val)
}

function redrawLeadVisual () {
  let { width, height } = machine.getState().screen,
      use = $('.lead-visual')[0].removeChild($('.lead-visual > use')[0]),
      remWidth = machine.getState().screen.width / rem(1),
      centreOffset = remWidth < 62 ? 0 : width/4;
  $(".lead-visual")[0].setAttribute('viewBox', `-${width/2} -${height/2} ${width} ${height}`);
  $('.lead-visual > use').forEach(x => x.remove());
  $('.lead-visual > circle').forEach(x => x.setAttribute('cx', centreOffset));
  function rand () { return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random()) }
  for (let i = 0, x, y, n = Math.max(width, height)**1.5 / 150; i < n; i++) {
    do {
      x = (rand()/4 + centreOffset/width) * Math.max(width, height);
      y = rand()/4 * Math.max(width, height)
    } while (Math.sqrt((x - centreOffset)**2 + y**2) < 25);
    let respLead = [[.006, 8e4],[.009, 3e4]][+(remWidth < 35)],
        scale = Math.exp(.5 * (.0008**2) * (1e6 - y**2 - (x - centreOffset)**2))/5 +
          Math.exp(-.25 * (respLead[0]**4) * (1e6 + 1.5*(respLead[1] - y**2 - (x - centreOffset)**2)**2)),
        rotate = Math.atan2(y, x - centreOffset) * 180 / Math.PI;
    use.setAttribute('x', x);
    use.setAttribute('y', y);
    use.setAttribute('width', 5 * scale);
    use.setAttribute('height', 30 * scale);
    $('animateTransform[type=rotate]', use)[0].setAttribute('values', `0, ${centreOffset}, 0; 360, ${centreOffset}, 0`);
    $('animateTransform[type=rotate]', use)[0].setAttribute('dur', Math.sqrt((x - centreOffset)**2 + y**2) / scale / 6 + 's')
    $('animateTransform[type=rotate]', use)[1].setAttribute('values', `${rotate}, ${x}, ${y}; ${rotate}, ${x}, ${y}`);
    $('.lead-visual')[0].appendChild(use.cloneNode(true))
  }
}

function replaceLink (scope, val, protocol) {
  let link = document.createElement('a'),
      valNoSpace = val.replace(/ /, '');
  link.setAttribute('href', protocol ? protocol + ':' + valNoSpace : valNoSpace);
  link.setAttribute('class', 'hidden');
  link.textContent = val;
  scope.parentNode.replaceChild(link, scope)
}


// Logo init

Logo().then(obj => ((Logo = obj).loop = Logo.loopGen())());


// Page state

let machine = new $.Machine({
      screen: {
        index: Math.floor(window.scrollY / window.innerHeight),
        offset: window.scrollY % window.innerHeight,
        width: window.innerWidth,
        height: window.innerHeight
      },
      headerKeyframe: null
    })

    .on('scroll', function (offset) {
      let val, { width, height } = this.screen;
      this.screen.index = Math.floor(offset / height);
      this.screen.offset = offset % height;
      if (width >= rem(35) && height >= rem(33)) {
        if (offset < height - rem(16)) val = 1;
        else if (offset < height) val = (height - offset) / rem(16);
        else val = 0;
        val == this.headerKeyframe || redrawHeader(offset, this.headerKeyframe = val)
      };
    })

    .on('resize', function (screenHeight, screenWidth) {
      let resizeFlag = (this.screen.width < rem(35) || this.screen.height < rem(33)) != (screenWidth < rem(35) || screenHeight < rem(33)),
          val, scroll, offset = this.screen.offset * screenHeight / this.screen.height,
          height = this.screen.height = screenHeight,
          width = this.screen.width = screenWidth;
      scrollTo(0, scroll = height * this.screen.index + (this.screen.offset = offset));
      if (width < rem(35) || (height < rem(33))) val = 0;
      else if (scroll < height - rem(16)) val = 1;
      else if (scroll < height) val = (height - scroll) / rem(16);
      else val = 0;
      redrawHeader(scroll, this.headerKeyframe = val);
      redrawLeadVisual();
      resizeFlag && ((screenWidth < rem(35) || screenHeight < rem(33)) ? Logo.resize(rem(5), rem(3)) : Logo.resize(rem(40/3), rem(8)))
    });


// UI Events

$.addEvents({
  "": {
    load () {
      machine.emit('scroll', window.scrollY);
      machine.emit('resize', window.innerHeight, window.innerWidth);
      new IntersectionObserver(entries =>
        entries.forEach(entry => $('.lead-visual')[0].classList[entry.isIntersecting ? 'remove' : 'add']('unloaded'))
      ).observe($('#lead')[0]);
      fetch('https://diarie.herokuapp.com/ping', { mode: 'no-cors'} )
    },
    scroll (e) {
      e.stopPropagation();
      machine.emit('scroll', window.scrollY)
    },
    resize (e) {
      e.stopPropagation();
      machine.emit('resize', window.innerHeight, window.innerWidth)
    },
    visibilitychange () {
      $('.lead-visual')[0].classList.toggle('unloaded')
    }
  },
  ".name, nav > *": {
    click () {
      document.getElementById(this.dataset.link).scrollIntoView()
    }
  },
  ".display": {
    click () {
      this.remove();
      replaceLink($('.phone-number')[0], '0422 8' + '11 274', 'tel');
      replaceLink($('.email')[0], 'ajh@t' + 'uta.io', 'mailto');
      replaceLink($('.linkedin')[0], 'https://www.linkedin.com/in/aidan-ha' + 'mwood-b12051166');
      replaceLink($('.resume')[0], 'https://ajhamwood.github.io/ResumeOfAidanHamwood.pdf')
    }
  }
})
