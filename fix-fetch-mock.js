const fs = require('fs');
const files = [
  'src/__tests__/integration/property-search.test.tsx',
  'src/__tests__/styling/homepage-styling.test.tsx',
  'src/__tests__/e2e/complete-user-flows.test.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Extract the properties array
  const regex = /jest\.mock\('@\/lib\/data'.+?mockResolvedValue\((.+?)\)( |as any|\n)*\)\)?;/s;
  const match = content.match(regex);
  
  if (match) {
    const propsArray = match[1];
    const fetchMock = `
const mockPropertiesConfig = ${propsArray};
global.fetch = jest.fn((url) => {
  if (url.includes('/api/properties')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ properties: mockPropertiesConfig, pagination: { total: mockPropertiesConfig.length, hasMore: false } }),
    });
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  });
}) as jest.Mock;
`;
    // Replace the lib/data mock with the fetch mock
    content = content.replace(regex, fetchMock);
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  } else {
    console.log('No match in', file);
  }
});
