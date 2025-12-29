#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מגן על layer.html מפני הרס
בודק שכל האלמנטים הקריטיים קיימים לפני ואחרי שינויים
"""

import sys
import os
from pathlib import Path

CRITICAL_ELEMENTS = {
    'required_ids': [
        'groupsGrid'
    ],
    'required_scripts': [
        'data.js',
        'shared-utils.js',
        'auto-load-data.js',
        'live-reload.js'
    ],
    'required_functions': [
        'ensureData',
        'buildCard',
        'render'
    ],
    'required_css_classes': [
        '.group-card',
        '.group-meta',
        '.group-count'
    ],
    'required_strings': [
        'setInterval(render, 4000)',
        'const layerParam',
        'render();',
        '<!DOCTYPE html>',
        'class="grid"'
    ],
    'required_keywords': [
        'נורית מויאל'
    ]
}

def check_file(file_path):
    """Check if file is valid"""
    file_label = Path(file_path).name
    if not os.path.exists(file_path):
        print(f"ERROR: File {file_label} does not exist!")
        return False
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"ERROR reading file: {e}")
        return False
    
    issues = []
    
    for element_id in CRITICAL_ELEMENTS['required_ids']:
        if f'id="{element_id}"' not in content:
            issues.append(f'MISSING id="{element_id}"')
    
    # Check Scripts
    for script in CRITICAL_ELEMENTS['required_scripts']:
        if f'src="{script}"' not in content:
            issues.append(f'MISSING script: {script}')
    
    for func in CRITICAL_ELEMENTS['required_functions']:
        if f'function {func}' not in content:
            issues.append(f'MISSING function: {func}')
    
    for css_class in CRITICAL_ELEMENTS['required_css_classes']:
        if css_class not in content:
            issues.append(f'MISSING CSS class: {css_class}')
    
    for structure in CRITICAL_ELEMENTS['required_strings']:
        if structure not in content:
            issues.append(f'MISSING required string/structure: {structure}')

    for keyword in CRITICAL_ELEMENTS['required_keywords']:
        if keyword not in content:
            issues.append(f'MISSING keyword: {keyword}')
    
    if issues:
        print("=" * 60)
        print(f"ERROR: Found {len(issues)} issues in {file_label}:")
        print("=" * 60)
        for issue in issues:
            print(f"  {issue}")
        print("=" * 60)
        return False
    else:
        print(f"OK - {file_label} - All critical elements exist")
        return True

def main():
    file_path = 'layer.html'
    
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    
    print(f"\nChecking {Path(file_path).name}...")
    print("=" * 60)
    
    if check_file(file_path):
        print("\nOK - File is valid, safe to edit")
        sys.exit(0)
    else:
        print("\nERROR - File is not valid, DO NOT continue editing!")
        sys.exit(1)

if __name__ == '__main__':
    main()

