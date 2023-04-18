const marked = require('marked');

module.exports = {
  improve: '@apostrophecms/rich-text-widget',
  beforeSuperClass(self) {
    self.options.editorInsertMenu = {
      ...self.options.editorInsertMenu,
      ai: {
        icon: 'robot-icon',
        label: 'aposAiHelper:generateTextLabel',
        component: 'AposAiHelperTextDialog',
        description: 'aposAiHelper:generateTextDescription'
      }
    };
  },
  init(self) {
    console.log(Object.keys(self.options.editorInsertMenu));
  },
  apiRoutes(self) {
    return {
      post: {
        async aiHelper(req) {
          const aiHelper = self.apos.modules['@apostrophecms/ai-helper'];
          let prompt = self.apos.launder.string(req.body.prompt);
          const headingLevels = self.apos.launder.strings(req.body.headingLevels);
          if (!prompt.length) {
            throw self.apos.error('invalid');
          }
          // Fake results for cheap & offline testing
          if (process.env.APOS_AI_HELPER_MOCK) {
            return {
              text: 'The quick brown fox generated the lazy dog. The quick brown fox generated the lazy dog. The quick brown fox generated the lazy dog. The quick brown fox generated the lazy dog. The quick brown fox generated the lazy dog. The quick brown fox generated the lazy dog. The quick brown fox generated the lazy dog. The quick brown fox generated the lazy dog.'
            };
          }
          prompt = `
            Generate text in markdown format, using only the following heading levels:
            
            ${headingLevels.join(', ')}
            
            Based on the following prompt:
            
            ${prompt}
          `;
          const body = {
            prompt,
            model: aiHelper.options.textModel,
            max_tokens: aiHelper.options.textMaxTokens,
            n: 1
          };
          try {
            const result = await self.apos.http.post(`https://api.openai.com/v1/completions`, {
              headers: {
                Authorization: `Bearer ${process.env.OPENAI_KEY}`
              },
              body
            });
            if (!result?.choices?.[0]?.text) {
              throw self.apos.error('error');
            }
            console.log(JSON.stringify(result, null, '  '));
            const html = marked.parse(result.choices[0].text);
            console.log(html);
            return {
              html
            };
          } catch (e) {
            console.error(JSON.stringify(e, null, '  '));
            throw e;
          }
        }
      }
    };
  }  
}