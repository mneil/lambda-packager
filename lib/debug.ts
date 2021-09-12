import Debug from 'debug';
import * as path from 'path';

function _getCallerFile() {
  const originalFunc = Error.prepareStackTrace;

  let callerfile;
  try {
    const err = new Error();
    let currentfile;

    Error.prepareStackTrace = function (err, stack) {
      return stack;
    };

    currentfile = (err.stack! as any).shift().getFileName();

    while (err.stack!.length) {
      callerfile = (err.stack! as any).shift().getFileName();
      if (currentfile !== callerfile) break;
    }
  } catch (e) {}
  Error.prepareStackTrace = originalFunc;
  return callerfile;
}

export const log = () => {
  const baseDir = path.dirname(__dirname);
  const callerFile = _getCallerFile();
  const relativeCaller = path
    .relative(baseDir, callerFile) // get relative location of the file from the root of the package
    .replace(new RegExp(path.sep, 'g'), ':') // replace path separator with colons
    .split('.') // remove the file extension by splitting on the periods
    .slice(0, -1) // remove the last item in the array (the extension)
    .join(''); // put it all back together
  return Debug(`lp:${relativeCaller}`);
};
