const { execSync } = require('child_process');

try {
  const output = execSync('npx tsc --noEmit', {
    cwd: __dirname,
    encoding: 'utf-8',
    stdio: 'pipe'
  });
  console.log('TypeScript compilation succeeded!');
  if (output) {
    console.log(output);
  }
} catch (error) {
  console.log('TypeScript compilation FAILED with errors:');
  console.log(error.stdout || error.message);
  if (error.stderr) {
    console.log('STDERR:', error.stderr);
  }
  process.exit(1);
}
