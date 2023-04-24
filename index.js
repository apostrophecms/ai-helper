const fs = require('fs');
const path = require('path');

module.exports = {
  init() {
    if (!(process.env.APOS_OPENAI_KEY || process.env.APOS_AI_HELPER_MOCK)) {
      // We do not document the mock because it is for internal testing
      throw new Error('APOS_OPENAI_KEY must be set in your environment');
    }
  },
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
