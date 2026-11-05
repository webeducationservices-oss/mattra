/* Google Ads website call tracking.
   Visitors who arrived from a Google ad see a Google forwarding number that rings
   Mattra's main line, and Google reports calls of 60 seconds or more as a
   conversion on that ad click. Everyone else keeps (207) 777-6020. Loaded by
   components.js on full pages and directly on pages without it (/lp/, savings check). */
(function () {
  if (window.__mattraCallTracking) return;
  window.__mattraCallTracking = true;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  var MAIN_TEXT = /\(?207\)?[\s.\-]?777[\s.\-]?6020/g;
  var swapped = null;

  function apply() {
    if (!swapped) return;
    document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
      if (/2077776020$/.test(a.getAttribute('href').replace(/\D/g, ''))) a.setAttribute('href', 'tel:+' + swapped.digits);
    });
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode && n.parentNode.nodeName;
        if (p === 'SCRIPT' || p === 'STYLE' || p === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
        MAIN_TEXT.lastIndex = 0;
        return MAIN_TEXT.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) { n.nodeValue = n.nodeValue.replace(MAIN_TEXT, swapped.text); });
  }

  gtag('config', 'AW-16459917667/c7uyCJW_1bIdEOPS2ag9', {
    phone_conversion_number: '(207) 777-6020',
    phone_conversion_callback: function (formatted, mobile) {
      var digits = String(mobile || formatted || '').replace(/\D/g, '');
      if (digits.length === 10) digits = '1' + digits;
      if (digits.length !== 11 || digits === '12077776020') return;
      swapped = { text: formatted, digits: digits };
      apply();
      // the header, footer and form render after load, so catch them too
      setTimeout(apply, 1500);
      setTimeout(apply, 4000);
    }
  });
})();
