const fs = require('fs');

const fixPropertySearch = () => {
  const file = 'src/__tests__/integration/property-search.test.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Replace loader wait with findByTestId('search-input')
  const waitRegex = /await waitFor\(\(\) => \{\s*expect\(screen\.queryByTestId\('loader'\)\)\.not\.toBeInTheDocument\(\);\s*\}\);/g;
  content = content.replace(waitRegex, "await screen.findByTestId('search-input');\n    await screen.findByTestId('map-view');");

  // Fix Map showing 2 properties
  content = content.replace(
    /expect\(screen\.getByText\('Map showing 2 properties'\)\)\.toBeInTheDocument\(\);/g,
    "await screen.findByText('Map showing 2 properties');"
  );
  
  content = content.replace(
    /expect\(screen\.getByText\('Map showing 0 properties'\)\)\.toBeInTheDocument\(\);/g,
    "await screen.findByText('Map showing 0 properties');"
  );

  fs.writeFileSync(file, content);
};

fixPropertySearch();
console.log('Fixed property-search tests');
