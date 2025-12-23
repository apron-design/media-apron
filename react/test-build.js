// 测试构建产物是否正确
const fs = require('fs');
const path = require('path');

console.log('🔍 检查构建产物...\n');

const distPath = path.join(__dirname, 'dist');
const requiredFiles = [
  'index.esm.js',
  'index.cjs.js',
  'index.d.ts',
  'style.css',
  'index.esm.js.map',
  'index.cjs.js.map',
];

let allPassed = true;

// 检查必需文件
console.log('📂 检查必需文件:');
requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${file}`);
  if (!exists) allPassed = false;
});

// 检查类型声明目录
console.log('\n📁 检查类型声明:');
const componentsPath = path.join(distPath, 'components');
if (fs.existsSync(componentsPath)) {
  console.log('  ✅ components/');
  
  const videoPath = path.join(componentsPath, 'Video');
  if (fs.existsSync(videoPath)) {
    console.log('    ✅ Video/');
    console.log('      ✅ index.d.ts');
    console.log('      ✅ types.d.ts');
  }
  
  const audioPath = path.join(componentsPath, 'Audio');
  if (fs.existsSync(audioPath)) {
    console.log('    ✅ Audio/');
    console.log('      ✅ index.d.ts');
    console.log('      ✅ types.d.ts');
  }
} else {
  console.log('  ❌ components/ 目录不存在');
  allPassed = false;
}

// 检查文件大小
console.log('\n📊 文件大小:');
requiredFiles.forEach(file => {
  const filePath = path.join(distPath, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    console.log(`  ${file}: ${sizeKB} KB`);
  }
});

// 检查 package.json
console.log('\n📦 检查 package.json:');
const packageJson = require('./package.json');
console.log(`  名称: ${packageJson.name}`);
console.log(`  版本: ${packageJson.version}`);
console.log(`  Main: ${packageJson.main}`);
console.log(`  Module: ${packageJson.module}`);
console.log(`  Types: ${packageJson.types}`);

// 最终结果
console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ 所有检查通过！包已准备好发布。');
  process.exit(0);
} else {
  console.log('❌ 部分检查失败，请修复后再发布。');
  process.exit(1);
}

