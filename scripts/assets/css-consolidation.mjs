// Only remove an earlier declaration when an identical declaration for the exact
// same selector and conditional context occurs later. Different fallback values
// and every rule inside keyframes/layers are preserved.
export function consolidateCSS(root){
 const seen=new Set();let removed=0,emptyRules=0;const rules=[];root.walkRules(rule=>rules.push(rule));
 for(const rule of rules.reverse()){
  const parents=[];let safe=true;
  for(let p=rule.parent;p&&p.type!=='root';p=p.parent){if(p.type!=='atrule'||!['media','supports'].includes(p.name)){safe=false;break;}parents.unshift([p.name,p.params]);}
  if(!safe)continue;
  for(const decl of [...(rule.nodes||[])].reverse()){
   if(decl.type!=='decl')continue;
   const key=JSON.stringify([parents,rule.selectors.join(','),decl.prop,decl.value,Boolean(decl.important)]);
   if(seen.has(key)){decl.remove();removed++;}else seen.add(key);
  }
  if(!rule.nodes.length){rule.remove();emptyRules++;}
 }
 function format(parent,depth=0){
  const pad='  '.repeat(depth);
  for(const [i,node]of parent.nodes.entries()){
   node.raws.before=parent.type==='root'?(i?'\n\n':''):'\n'+pad;
   if(node.type==='decl'){node.raws.between=': ';if(node.important)node.raws.important=' !important';}
   else if(node.type==='comment'){node.raws.left=' ';node.raws.right=' ';}
   else if(node.nodes){
    if(node.type==='rule')node.selector=node.selectors.join(',\n'+pad);
    node.raws.between=' ';node.raws.after='\n'+'  '.repeat(depth);node.raws.semicolon=true;
    format(node,depth+1);
   }
  }
 }
 format(root);root.raws.after='\n';return {removed,emptyRules};
}
