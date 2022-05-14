/**
 * Notice: convict 是专为node设计的，这边临时使用了比较低的版本 6.0.1, 高版本不支持在浏览器环境中使用
 */
import convict from 'convict';
import * as convictFormatWithValidator from 'convict-format-with-validator';
import { configSchema } from './schema';

convict.addFormat(convictFormatWithValidator.url);

function assert(assertion: boolean, msg: string) {
  if (!assertion) throw new Error(msg);
}

convict.addFormat({
  name: 'float',
  coerce: (v: string) => parseFloat(v),
  validate: (v: number) => assert(Number.isFinite(v), 'must be a number'),
});

/**
 * Use `yarn gen-config-docs` to re-generate the README.md and the
 * public/config/config.example.js files.
 */
const configConvict = convict(configSchema);

function formatDocs() {
  function _formatDocs(docs: any, property: string | null, schema: any) {
    if (schema._cvtProperties) {
      Object.entries(schema._cvtProperties).forEach(([name, value]) => {
        _formatDocs(docs, `${property ? `${property}.` : ''}${name}`, value);
      });

      return docs;
    } else if (property) {
      docs[property] = {
        doc: schema.doc,
        format: JSON.stringify(schema.format, null, 2),
        default: JSON.stringify(schema.default, null, 2),
      };
    }

    return docs;
  }

  return _formatDocs({}, null, configConvict.getSchema());
}

function formatJson(data: string) {
  return data ? `\`${data.replace(/\n/g, '')}\`` : '';
}

function dumpDocsMarkdown() {
  let data = `# ![edumeet logo](/app/public/images/logo.edumeet.svg) App Configuration properties list:

 | Name | Description | Format | Default value |
 | :--- | :---------- | :----- | :------------ |
 `;

  Object.entries(formatDocs()).forEach((entry: [string, any]) => {
    const [name, value] = entry;

    data += `| ${name} | ${value.doc.replace(/\n/g, ' ')} | ${formatJson(
      value.format
    )} | \`${formatJson(value.default)}\` |\n`;
  });

  data += `

 ---

 *Document generated with:* \`yarn gen-config-docs\` *from:* [config.ts](src/config.ts).
 `;

  return data;
}

function dumpExampleConfigJs() {
  let data = `/**
  * Tailchat meeting App Configuration
  *
  * The configuration documentation is available also:
  * - in the app/README.md file in the source tree
  * - visiting the /?config=true page in a running instance
  */

 // eslint-disable-next-line
 var config = {
 `;

  Object.entries(formatDocs()).forEach((entry: [string, any]) => {
    // eslint-disable-next-line
    let [name, value] = entry;

    if (name.includes('.')) name = `'${name}'`;

    data += `\n\t// ${value.doc.replace(/\n/g, '\n\t// ')}
 \t${name} : ${value.default},
 `;
  });

  data += `};

 // Generated with: \`yarn gen-config-docs\` from app/src/config.ts
 `;

  return data;
}

// run the docs generator
// TODO: Ignore in browser env
// if (typeof window === 'undefined')
// {
// 	import('fs').then((fs) =>
// 	{
// 		fs.writeFileSync('public/config/README.md', dumpDocsMarkdown());
// 		fs.writeFileSync('public/config/config.example.js', dumpExampleConfigJs());
// 	});
// }

type ConfigType = ReturnType<typeof configConvict['getProperties']>;
let config: ConfigType = {} as ConfigType;
let configError = '';

// Load config from window object
if (typeof window !== 'undefined' && (window as any).config !== undefined) {
  configConvict.load((window as any).config);
}

// Perform validation
try {
  configConvict.validate({ allowed: 'strict' });
  config = configConvict.getProperties();
} catch (error: any) {
  console.error(error);
  configError = error.message;
}

// Override the window config with the validated properties.
if (typeof window !== 'undefined') {
  (window as any)['config'] = config;
}

export { config, configError, formatDocs };
