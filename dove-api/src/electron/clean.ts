import fs from 'fs';
import path from 'path';

fs.rmSync(path.resolve('dist'), { recursive: true, force: true });