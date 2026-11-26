import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {award,getLevel,newState} from '../js/gamification.js';
import {validateCurriculum} from '../js/importer.js';
import {pack,unpack} from '../js/zip.js';
const lessons=JSON.parse(await readFile(new URL('../data/lessons.json',import.meta.url),'utf8'));
test('33 bài học hợp lệ, không trùng ID',()=>{
  assert.equal(validateCurriculum({schemaVersion:1,lessons}).length,33);
  assert.throws(()=>validateCurriculum({schemaVersion:1,lessons:[lessons[0],lessons[0]]}),/trùng/);
});
test('EXP chống ghi lặp và dùng ngưỡng theo cấp',()=>{
  const state=newState();
  award(state,'lesson:line',100);award(state,'lesson:line',100);
  assert.deepEqual(getLevel(state.events),{level:2,xp:0,max:283});
});
test('ZIP giữ nội dung tiếng Việt và ảnh dạng Blob',async()=>{
  const img=new Blob([Uint8Array.of(137,80,78,71)]);
  const zip=await pack([['backup.json','Bản vẽ'],['blobs/0',img]]);
  const files=await unpack(zip);
  assert.equal(await files.get('backup.json').text(),'Bản vẽ');
  assert.deepEqual(new Uint8Array(await files.get('blobs/0').arrayBuffer()),Uint8Array.of(137,80,78,71));
});
