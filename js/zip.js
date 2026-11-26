const encoder=new TextEncoder(),decoder=new TextDecoder();
function crc32(bytes){
  let crc=-1;
  for(const b of bytes){crc^=b;for(let i=0;i<8;i++)crc=(crc>>>1)^(-(crc&1)&0xedb88320);}
  return (crc^-1)>>>0;
}
export async function pack(files){
  const chunks=[],central=[];
  let offset=0,centralSize=0;
  for(const [path,value] of files){
    const name=encoder.encode(path),body=new Uint8Array(await new Blob([value]).arrayBuffer()),crc=crc32(body);
    const local=new Uint8Array(30+name.length),l=new DataView(local.buffer);
    l.setUint32(0,0x04034b50,true);l.setUint16(4,20,true);l.setUint16(6,2048,true);l.setUint32(14,crc,true);l.setUint32(18,body.length,true);l.setUint32(22,body.length,true);l.setUint16(26,name.length,true);local.set(name,30);
    const record=new Uint8Array(46+name.length),c=new DataView(record.buffer);
    c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,2048,true);c.setUint32(16,crc,true);c.setUint32(20,body.length,true);c.setUint32(24,body.length,true);c.setUint16(28,name.length,true);c.setUint32(42,offset,true);record.set(name,46);
    chunks.push(local,body);central.push(record);offset+=local.length+body.length;centralSize+=record.length;
  }
  const end=new Uint8Array(22),e=new DataView(end.buffer);
  e.setUint32(0,0x06054b50,true);e.setUint16(8,central.length,true);e.setUint16(10,central.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);
  return new Blob([...chunks,...central,end],{type:'application/zip'});
}
export async function unpack(file){
  if(file.size>150*1024*1024)throw Error('ZIP vượt quá 150 MB.');
  const bytes=new Uint8Array(await file.arrayBuffer()),v=new DataView(bytes.buffer);
  const u16=i=>v.getUint16(i,true),u32=i=>v.getUint32(i,true);
  let footer=bytes.length-22;
  while(footer>=Math.max(0,bytes.length-65557)&&u32(footer)!==0x06054b50)footer--;
  if(footer<Math.max(0,bytes.length-65557))throw Error('ZIP không hợp lệ.');
  let at=u32(footer+16),total=0;
  const files=new Map();
  for(let i=0;i<u16(footer+10);i++){
    if(u32(at)!==0x02014b50)throw Error('Danh mục ZIP bị lỗi.');
    const flags=u16(at+8),method=u16(at+10),crc=u32(at+16),size=u32(at+20),expected=u32(at+24);
    const nameSize=u16(at+28),local=u32(at+42),name=decoder.decode(bytes.slice(at+46,at+46+nameSize));
    at+=46+nameSize+u16(at+30)+u16(at+32);
    if(name.endsWith('/'))continue;
    if(flags&1||!name||name.startsWith('/')||name.split('/').includes('..')||name.includes('\\')||files.has(name)||u32(local)!==0x04034b50)throw Error('Mục ZIP không hợp lệ.');
    const start=local+30+u16(local+26)+u16(local+28);
    total+=expected;
    if(total>200*1024*1024||start+size>bytes.length)throw Error('Kích thước giải nén vượt giới hạn.');
    let output=bytes.slice(start,start+size);
    if(method===8){
      const reader=new Blob([output]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
      output=new Uint8Array(expected);
      let pos=0;
      for(;;){const {value,done}=await reader.read();if(done)break;if(pos+value.length>expected){await reader.cancel();throw Error('Kích thước ZIP không khớp.');}output.set(value,pos);pos+=value.length;}
      if(pos!==expected)throw Error('Kích thước ZIP không khớp.');
    }else if(method!==0)throw Error('Kiểu nén ZIP chưa được hỗ trợ.');
    if(output.length!==expected||crc32(output)!==crc)throw Error('Dữ liệu ZIP bị hỏng.');
    files.set(name,new Blob([output]));
  }
  return files;
}
