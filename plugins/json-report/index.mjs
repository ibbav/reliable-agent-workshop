import {writeFile} from "node:fs/promises";
import path from "node:path";
export default {apiVersion:1,async write({outputDir,result}) {
  for(const name of ["attempts","summary"]) await writeFile(path.join(outputDir,`${name}.json`),JSON.stringify(result[name],null,2)+"\n",{flag:"wx"});
}};
