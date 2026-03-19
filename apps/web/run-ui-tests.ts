#!/usr/bin/env node
import { runUIComponentTests } from './lib/ui-tests';

console.log('Starting UI tests...');
runUIComponentTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
