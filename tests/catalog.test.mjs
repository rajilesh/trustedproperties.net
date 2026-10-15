import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { validateCatalog } from '../src/catalog.js';
import { projects } from '../src/content.js';

test('catalogue rejects duplicate routes, unsupported forms and unsafe URLs',()=>{
 const first=projects[0];
 for(const change of [{id:first.id},{slug:first.slug},{sourceUrl:'javascript:alert(1)'},{image:'//outside.example/image'},{preferred:'9 BHK'},{name:''}]) {
  const next={...first,id:999,slug:'new-project',...change};
  assert.throws(()=>validateCatalog([...projects,next]));
 }
});

test('add-property command writes valid records and leaves catalogue unchanged on failure',async()=>{
 const root=await mkdtemp(join(tmpdir(),'trusted-catalog-'));
 try{
  for(const dir of ['data','scripts','src'])await mkdir(join(root,dir));
  for(const file of ['scripts/add-property.mjs','src/catalog.js','data/properties.json'])await copyFile(file,join(root,file));
  await writeFile(join(root,'package.json'),'{"type":"module"}');
  const input={...projects[0],name:'Future Project',sourceUrl:'https://example.com/project/'};delete input.id;delete input.slug;
  await writeFile(join(root,'new.json'),JSON.stringify(input));
  const run=()=>spawnSync(process.execPath,[join(root,'scripts/add-property.mjs'),join(root,'new.json')],{encoding:'utf8'});
  const added=run();assert.equal(added.status,0,added.stderr);
  const content=await readFile(join(root,'data/properties.json'),'utf8');const records=JSON.parse(content);
  assert.equal(records.length,projects.length+1);assert.equal(records.at(-1).slug,'future-project');
  assert.equal(run().status,1);assert.equal(await readFile(join(root,'data/properties.json'),'utf8'),content);
 }finally{await rm(root,{recursive:true,force:true});}
});
