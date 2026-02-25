const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ?
            walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let count = 0;
walkDir('/Users/rediballa/real-estate-website/src', function (filePath) {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
        let original = fs.readFileSync(filePath, 'utf8');

        // We are looking for things like "bg-blue-100 30 " or "bg-white/90 80 backdrop-blur-md"
        // Basically, any standalone 2 digit number that is inside a className string.
        // A safe regex is to look for (bg-[a-z]+-\d+(?:/\d+)?|text-[a-z]+-\d+(?:/\d+)?|border-[a-z]+-\d+(?:/\d+)?|slate-50)\s+(\d{2})(\s+['"`])

        // Actually, simpler: just remove standalone 10,20,30,40,50,60,70,80,90,95 inside classNames
        // We can replace spaces followed by exactly two digits and a space, where the digits are multiples of 10 or 95.
        // Let's use a targeted regex that looks for these specific orphaned numbers AFTER a tailwind color class
        let replaced = original.replace(/(bg-[a-z]+-(?:\d+|\[var\([^\]]+\)\])(?:\/\d+)?)\s+(10|20|30|40|50|60|70|80|90|95)(?=\s+['"`A-Za-z])/g, '$1');
        replaced = replaced.replace(/(border-[a-z]+-(?:\d+|\[var\([^\]]+\)\])(?:\/\d+)?)\s+(10|20|30|40|50|60|70|80|90|95)(?=\s+['"`A-Za-z])/g, '$1');
        replaced = replaced.replace(/(text-[a-z]+-(?:\d+|\[var\([^\]]+\)\])(?:\/\d+)?)\s+(10|20|30|40|50|60|70|80|90|95)(?=\s+['"`A-Za-z])/g, '$1');

        // Also handle cases where the orphaned number is at the end of the string, e.g. "bg-blue-100 30"
        replaced = replaced.replace(/(bg-[a-z]+-(?:\d+|\[var\([^\]]+\)\])(?:\/\d+)?)\s+(10|20|30|40|50|60|70|80|90|95)(?=['"`])/g, '$1');
        replaced = replaced.replace(/(border-[a-z]+-(?:\d+|\[var\([^\]]+\)\])(?:\/\d+)?)\s+(10|20|30|40|50|60|70|80|90|95)(?=['"`])/g, '$1');
        replaced = replaced.replace(/(text-[a-z]+-(?:\d+|\[var\([^\]]+\)\])(?:\/\d+)?)\s+(10|20|30|40|50|60|70|80|90|95)(?=['"`])/g, '$1');

        if (original !== replaced) {
            count++;
            fs.writeFileSync(filePath, replaced);
            console.log(`Fixed ${filePath}`);
        }
    }
});
console.log(`Fixed ${count} files.`);
