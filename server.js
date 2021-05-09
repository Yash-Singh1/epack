#!/usr/bin/env node

process.title = 'epack-site';
const fs = require('fs');
const express = require('express');
const app = express();

const port = process.env.PORT || 1534;
const rootDocs = new Set(['README.md', 'ROADMAP.md', 'CODE_OF_CONDUCT.md', 'CONTRIBUTING.md', 'LICENSE.md', 'ARCHITECTURE.md']);

app.set('subdomain offset', 1);

app.get('/*', (request, response) => {
  // A directory is trying to be read
  if (request.path.endsWith('/') && request.path !== '/') {
    return response.send(fs.readdirSync(`.${request.path}`));
  }

  /**
   * Check for side cases where:
   *  - doc subdomain is used instead of docs subdomain
   *  - /index.html is used instead of root /
   *  - MonkeyIDE license is requested (redirect to monkeyide repo)
   *  - favicon is requested
   */
  if (request.subdomains[0] === 'doc') {
    return response.redirect(request.protocol + '://' + request.get('host').replace('doc', 'docs') + request.originalUrl);
  }

  if (request.path === '/index.html') {
    return response.redirect('/');
  }

  if (request.path === '/MONKEYIDE_LICENSE.md') {
    return response.redirect('https://raw.githubusercontent.com/Yash-Singh1/monkeyide/master/LICENSE');
  }

  if (request.path.includes('favicon.ico')) {
    return response.sendStatus(204);
  }

  // Figure out which file to send, sometimes it is different then requested
  let file = request.path.slice(1);
  if (request.path === '/') {
    file = 'index.html';
  } else if (request.path === '/LICENSE.md') {
    file = 'LICENSE';
  }

  // Determine the root from which to send the file
  let root = './www/';
  if (request.path.startsWith('/node_modules/')) {
    root = './';
  } else if (request.subdomains[0] === 'docs') {
    root = rootDocs.has(request.path.slice(1)) || request.path.startsWith('/img/') ? './' : './docs/';
  }

  // Prevent loads of 404 logs
  if (!fs.existsSync(`${root}${file}`)) {
    return response.sendStatus(404);
  }

  try {
    response.sendFile(file, {root});
  } catch {
    response.sendStatus(404);
  }
});

app.listen(port, () => {
  console.log('done');
  console.log();
  console.log('Listening on :' + port);
});
