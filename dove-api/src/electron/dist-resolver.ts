import fse from 'fs-extra';
import path from "path";

const srcDir = path.join(path.resolve('..'), 'dove-ui', 'dist', 'dove-ui');
const destDir = path.join(path.resolve('.'), 'dist', 'electron', 'dove-ui');

try {
  fse.copySync(srcDir, destDir);
} catch (err) {
  console.error(err);
}