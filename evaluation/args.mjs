export function parseArgs(args,booleanFlags=[]) {
  const values={};
  for(let i=0;i<args.length;i++) {
    const key=args[i].replace(/^--/,"");
    if(!args[i].startsWith("--") || Object.hasOwn(values,key)) throw new Error("Use unique named arguments.");
    if(booleanFlags.includes(key)) values[key]=true;
    else {if(!args[i+1] || args[i+1].startsWith("--")) throw new Error(`Missing value for --${key}.`);values[key]=args[++i];}
  }
  return values;
}
