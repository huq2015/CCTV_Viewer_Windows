function getFastLoadingScript() {
  return `
    (function() {
      function FastLoading() {
        const fullscreenBtn = document.querySelector('#player_pagefullscreen_yes_player') 
          || document.querySelector('.videoFull');
        if (fullscreenBtn) return;

        Array.from(document.getElementsByTagName('img')).forEach(img => {
          img.src = '';
        });

        const scriptKeywords = ['login', 'index', 'daohang', 'grey', 'jquery'];
        Array.from(document.getElementsByTagName('script')).forEach(script => {
          if (scriptKeywords.some(keyword => script.src.includes(keyword))) {
            script.src = '';
          }
        });

        const classNames = ['newmap', 'newtopbz', 'newtopbzTV', 'column_wrapper'];
        classNames.forEach(className => {
          Array.from(document.getElementsByClassName(className)).forEach(div => {
            div.innerHTML = '';
          });
        });

        setTimeout(FastLoading, 4);
      }
      FastLoading();
    })();
  `;
}

function getAutoFullscreenScript() {
  return `
    (function() {
      function AutoFullscreen() {
        var fullscreenBtn = document.querySelector('#player_pagefullscreen_yes_player') 
          || document.querySelector('.videoFull');
        if (fullscreenBtn != null) {
          fullscreenBtn.click();
          var video = document.querySelector('video');
          if (video) video.volume = 1;
        } else {
          setTimeout(function() { AutoFullscreen(); }, 16);
        }
      }
      AutoFullscreen();
    })();
  `;
}

function getZoomScript(direction) {
  const delta = direction === 'in' ? 0.1 : -0.1;
  return `
    (function() {
      var zoom = parseFloat(document.body.style.zoom) || 1;
      var newZoom = zoom + ${delta};
      if (newZoom > 0.2) {
        document.body.style.zoom = newZoom;
      }
    })();
  `;
}

function getPlayPauseScript() {
  return `
    (function() {
      var video = document.querySelector('video');
      if (video) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }
    })();
  `;
}

function getFullscreenToggleScript() {
  return `
    (function() {
      var fullscreenBtn = document.querySelector('#player_pagefullscreen_yes_player') 
        || document.querySelector('.videoFull')
        || document.querySelector('.videoFull_ac');
      if (fullscreenBtn) {
        fullscreenBtn.click();
      }
    })();
  `;
}

module.exports = {
  getFastLoadingScript,
  getAutoFullscreenScript,
  getZoomScript,
  getPlayPauseScript,
  getFullscreenToggleScript
};
