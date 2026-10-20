import fs from 'node:fs';import path from 'node:path';import {fileURLToPath}from'node:url';import {createRequire}from'node:module';
import {consolidateCSS}from'./css-consolidation.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),require=createRequire(path.join(process.env.COGNILAB_ASSET_DEPS||here,'package.json')),postcss=require('postcss');
const file=path.resolve(here,'../../shared/public-catalog.css'),root=postcss.parse(fs.readFileSync(file,'utf8'));
const stats=consolidateCSS(root);fs.writeFileSync(file,root.toString());console.log(JSON.stringify(stats));
