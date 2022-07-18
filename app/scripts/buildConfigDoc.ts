import { formatDocs } from '../src/config/index';
import fs from 'fs';
import path from 'path';

function formatJson(data: string) {
  return data ? `\`${data.replace(/\n/g, '')}\`` : '';
}

function dumpDocsMarkdown(): string {
  let data = `# ![logo](/app/public/images/logo.tailchat.svg) App Configuration properties list:

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

 *Document generated with:* \`pnpm gen-config-docs\` *from:* [config.ts](src/config.ts).
 `;

  return data;
}

function dumpExampleConfigJs(): string {
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
 \t${name}: ${String(value.default).replace(/\n/g, '\n  ')},
 `;
  });

  data += `};

 // Generated with: \`pnpm gen-config-docs\` from app/src/config.ts
 `;

  return data;
}

// run the docs generator
const docPath = path.resolve(__dirname, '../public/config/README.md');
fs.writeFileSync(docPath, dumpDocsMarkdown());
console.log('文档生成完毕:', docPath);

const configPath = path.resolve(
  __dirname,
  '../public/config/config.example.js'
);
fs.writeFileSync(configPath, dumpExampleConfigJs());
console.log('配置生成完毕:', configPath);
