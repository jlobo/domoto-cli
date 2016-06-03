const shell = require('electron').shell;

const links = document.querySelectorAll('a[href]');

Array.prototype.forEach.call(links, (link) => {
  const url = link.getAttribute('href');
  if (url.indexOf('http') !== 0 && url.indexOf('https') !== 0) {
    return;
  }

  link.addEventListener('click', (e) => {
    e.preventDefault();
    shell.openExternal(url);
  });
});
