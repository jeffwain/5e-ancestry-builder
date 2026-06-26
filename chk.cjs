const {parse}=require('@babel/parser');const fs=require('fs');
const f=process.argv[2];
let src=fs.readFileSync(f,'utf8').replace(/\r/g,'');
try{ parse(src,{sourceType:'module',plugins:['jsx']}); console.log('OK'); }
catch(e){
  const ln=e.loc?e.loc.line:0, col=e.loc?e.loc.column:0;
  console.log('ERR:',e.message);
  const lines=src.split('\n');
  for(let i=Math.max(0,ln-3);i<Math.min(lines.length,ln+2);i++){
    console.log((i+1===ln?'>>':'  ')+(i+1)+': '+JSON.stringify(lines[i]));
  }
}
