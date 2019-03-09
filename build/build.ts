import * as shell from 'shelljs';

shell.echo('building');
shell.rm('-rf', 'dist');
shell.exec('tsc --project tsconfig.json');
shell.cp('-R', 'src/public', 'dist/src/public/');

shell.echo('success');