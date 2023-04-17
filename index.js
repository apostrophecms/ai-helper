const fs = require('fs');
const path = require('path');

module.exports = {
  bundle: {
    directory: 'modules',
    modules: getBundleModuleNames()
  },
  options: {
    textModel: 'text-davinci-003',
    textMaxTokens: 1000
  }
};

function getBundleModuleNames() {
  const source = path.join(__dirname, './modules/@apostrophecms');
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => `@apostrophecms/${dirent.name}`);
}
