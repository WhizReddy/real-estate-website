import os
import re
import glob

replacements = [
    # structural
    (r'bg-linear-to-br from-slate-50 to-blue-50', r'bg-[var(--background)]'),
    (r'bg-white rounded-lg shadow p-6', r'card border-none p-6'),
    (r'bg-white shadow rounded-lg overflow-hidden', r'card overflow-hidden border-none'),
    (r'bg-white rounded-2xl shadow-xl p-8 border border-blue-100', r'card p-8 border-none'),
    (r'bg-white rounded-2xl shadow-xl p-8 border border-gray-100', r'card p-8 border-none'),
    (r'bg-white shadow-sm', r'bg-[var(--background)] shadow-sm dark:border-b dark:border-slate-800'),
    (r'bg-white/95 text-gray-900', r'bg-[var(--background)]/95 text-[var(--foreground)] dark:border-slate-800'),
    (r'bg-white divide-y', r'bg-[var(--background)] divide-y'),
    (r'hover:bg-gray-50', r'hover:bg-slate-50 dark:hover:bg-slate-800/50'),
    (r'bg-gray-50', r'bg-slate-50 dark:bg-slate-800/50'),
    (r'bg-white', r'bg-[var(--background)]'),
    
    # typography component-level
    (r'text-gray-900', r'text-[var(--foreground)]'),
    (r'text-gray-800', r'text-slate-800 dark:text-slate-200'),
    (r'text-gray-700', r'text-slate-700 dark:text-slate-300'),
    (r'text-gray-600', r'text-slate-600 dark:text-slate-400'),
    (r'text-gray-500', r'text-slate-500 dark:text-slate-400'),
    (r'text-gray-400', r'text-slate-400 dark:text-slate-500'),
    
    # borders
    (r'border-gray-200', r'border-gray-200 dark:border-slate-700'),
    (r'border-gray-300', r'border-gray-300 dark:border-slate-700'),

    # Input specific tweaks (avoids double application)
    (r'className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"',
     r'className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-[var(--background)] text-[var(--foreground)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"'),
     
    (r'className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"',
     r'className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-700 bg-[var(--background)] text-[var(--foreground)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"')
]

def process_file(filepath):
    print(f"Processing {filepath}...")
    with open(filepath, 'r') as f:
        content = f.read()

    original_content = content
    for pattern, repl in replacements:
        content = re.sub(pattern, repl, content)
        
    # Additional fix for inputs that might missed the regex because they were split to multiple lines
    content = content.replace("focus:ring-blue-500", "focus:ring-[var(--primary)]")
    
    # Modals bg-white was converted to bg-[var(--background)]
    content = content.replace("bg-gray-600 bg-opacity-50", "bg-slate-900/50 backdrop-blur-sm")

    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filepath}")

if __name__ == '__main__':
    admin_files = glob.glob('src/app/admin/**/*.tsx', recursive=True)
    for f in admin_files:
        # Avoid dashboard/page.tsx, properties/new/page.tsx, properties/[id]/edit/page.tsx 
        # as they've mostly been done, but running it again shouldn't hurt since regex is specific.
        # But actually, let's just run it over everything to catch remaining things.
        process_file(f)
