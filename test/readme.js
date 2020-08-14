const {readFileSync} = require("fs");
const {join, dirname} = require("path");
const tap = require("tap");

let readme = readFileSync(join(dirname(__dirname), "README.md"), {encoding: "utf8"});
let regex = /```JavaScript(.*?)```/sg;
for (let match; match = regex.exec(readme); ) {
    tap.assert(new Function("require", "code", "return eval(code)")(() => require(".."), match[1]));
}
