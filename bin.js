#!/usr/bin/env node

const path = require('path');
const { spawn } = require('child_process');
const electron = require('electron-prebuilt');

spawn(electron, [path.resolve(__dirname, 'src/electron')], { stdio: 'inherit' })
  .on('close', () => process.exit());
