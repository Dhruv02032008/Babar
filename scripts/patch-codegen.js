const fs = require('fs');
const path = require('path');

const codegenDir = path.join(__dirname, '..', 'node_modules', '@react-native', 'codegen', 'lib', 'parsers', 'typescript');

if (!fs.existsSync(codegenDir)) {
  process.exit(0);
}

// 1. Patch parser.js
const parserPath = path.join(codegenDir, 'parser.js');
if (fs.existsSync(parserPath)) {
  let content = fs.readFileSync(parserPath, 'utf8');
  if (!content.includes('typeName.right ? typeName.right.name')) {
    content = content.replace(
      /getTypeAnnotationName\(typeAnnotation\)\s*\{[\s\S]*?\n\s*\}/,
      `getTypeAnnotationName(typeAnnotation) {
    const typeName = typeAnnotation?.typeName;
    if (!typeName) {
      return undefined;
    }
    return typeName.name || (typeName.right ? typeName.right.name : undefined);
  }`
    );
    fs.writeFileSync(parserPath, content, 'utf8');
    console.log('[patch-codegen] Patched parser.js');
  }
}

// 2. Patch parseTopLevelType.js
const parseTopLevelPath = path.join(codegenDir, 'parseTopLevelType.js');
if (fs.existsSync(parseTopLevelPath)) {
  let content = fs.readFileSync(parseTopLevelPath, 'utf8');
  if (!content.includes('function getTypeName(')) {
    content = content.replace(
      /'use strict';/,
      `'use strict';

function getTypeName(typeName) {
  if (!typeName) return undefined;
  return typeName.name || (typeName.right ? typeName.right.name : undefined);
}`
    );
    content = content.replace(/types\[value\.typeName\.name\]/g, 'types[getTypeName(value.typeName)]');
    content = content.replace(/type\.typeName\.name === 'Readonly'/g, "getTypeName(type.typeName) === 'Readonly'");
    content = content.replace(/type\.typeName\.name === 'WithDefault'/g, "getTypeName(type.typeName) === 'WithDefault'");
    content = content.replace(/resolvedType\.typeName\.name === type\.typeName\.name/g, 'getTypeName(resolvedType.typeName) === getTypeName(type.typeName)');
    fs.writeFileSync(parseTopLevelPath, content, 'utf8');
    console.log('[patch-codegen] Patched parseTopLevelType.js');
  }
}

// 3. Patch componentsUtils.js
const componentsUtilsPath = path.join(codegenDir, 'components', 'componentsUtils.js');
if (fs.existsSync(componentsUtilsPath)) {
  let content = fs.readFileSync(componentsUtilsPath, 'utf8');
  if (content.includes('extractedTypeAnnotation.elementType === \'TSTypeReference\'\n      ? extractedTypeAnnotation.elementType.typeName.name')) {
    content = content.replace(
      `  const type =
    extractedTypeAnnotation.elementType === 'TSTypeReference'
      ? extractedTypeAnnotation.elementType.typeName.name
      : ((_extractedTypeAnnotat = extractedTypeAnnotation.elementType) ===
          null || _extractedTypeAnnotat === void 0
          ? void 0
          : _extractedTypeAnnotat.type) ||
        ((_extractedTypeAnnotat2 = extractedTypeAnnotation.typeName) === null ||
        _extractedTypeAnnotat2 === void 0
          ? void 0
          : _extractedTypeAnnotat2.name) ||
        extractedTypeAnnotation.type;`,
      `  const type =
    extractedTypeAnnotation.type === 'TSTypeReference' ||
    extractedTypeAnnotation.type === 'TSTypeAliasDeclaration'
      ? parser.getTypeAnnotationName(extractedTypeAnnotation)
      : extractedTypeAnnotation.elementType === 'TSTypeReference'
      ? parser.getTypeAnnotationName(extractedTypeAnnotation.elementType)
      : ((_extractedTypeAnnotat = extractedTypeAnnotation.elementType) ===
          null || _extractedTypeAnnotat === void 0
          ? void 0
          : _extractedTypeAnnotat.type) ||
        parser.getTypeAnnotationName(extractedTypeAnnotation) ||
        extractedTypeAnnotation.type;`
    );
    content = content.replace(
      'parser.getProperties(property.typeName.name, types)',
      'parser.getProperties(parser.getTypeAnnotationName(property), types)'
    );
    fs.writeFileSync(componentsUtilsPath, content, 'utf8');
    console.log('[patch-codegen] Patched componentsUtils.js');
  }
}
