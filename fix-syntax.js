const fs = require('fs');
const files = [
  'src/__tests__/integration/property-search.test.tsx',
  'src/__tests__/styling/homepage-styling.test.tsx',
  'src/__tests__/e2e/complete-user-flows.test.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // The issue: "  ]),\n};\nglobal.fetch"  -> should just be "  ];\nglobal.fetch"
  // And for property-search: "  ])\n};\nglobal.fetch"
  // And for complete-user-flows: "  ]) as any),\n};\nglobal.fetch"
  
  content = content.replace(/\]\)(\s*as any)?(,\s*)?\}(;)?\s*global\.fetch =/g, '];\nglobal.fetch =');
  content = content.replace(/\]\)(\s*as any)?\n\}(;)?\s*global\.fetch =/g, '];\nglobal.fetch =');

  fs.writeFileSync(file, content);
  console.log('Fixed syntax in', file);
});
