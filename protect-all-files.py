#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
מנגנון הגנה כללי - בודק את כל הקבצים הקריטיים
מונע הרס של קוד קיים בעת ביצוע שינויים
"""

import sys
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple

# הגדרת בדיקות לכל קובץ קריטי
FILE_CHECKS = {
    'index.html': {
        'required_ids': ['count7', 'count8', 'count9', 'totalCount'],
        'required_scripts': ['data.js', 'auto-load-data.js', 'update-teachers.js', 'live-reload.js'],
        'required_functions': ['updateCounts', 'refreshCounts', 'updateAdminUI'],
        'required_strings': ['DataStore.load', 'getLayerCount', 'getTotalCount']
    },
    'layer.html': {
        'required_ids': ['groupsGrid', 'layerTitle', 'layerDescription'],
        'required_scripts': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
        'required_functions': ['ensureData', 'buildCard', 'render'],
        'required_css_classes': ['.group-card', '.group-meta', '.group-count'],
        'required_strings': ['getGroupsByLayer', 'getGroupCount', 'class="grid"']
    },
    'data.js': {
        'required_functions': [
            'load', 'save', 'getLayerCount', 'getGroupCount', 
            'getTotalCount', 'getGroupsByLayer', 'getTeacher',
            'getLayerName', 'importGroup', '_invalidateCache'
        ],
        'required_strings': [
            'DataStore', 'localStorage', 'students', 'groups', 'teachers'
        ]
    },
    'auto-load-data.js': {
        'required_strings': [
            'DataStore.importGroup', 'נורית מויאל', 'loadAllGroups',
            'window.__dataLoaded', 'dataLoaded'
        ],
        'required_functions': ['loadAllGroups']
    },
    'shared-utils.js': {
        'required_functions': ['escapeHtml', 'getURLParameter'],
        'required_strings': ['window.SharedUtils', 'SharedUtils']
    }
}

def check_file(file_path: Path, checks: Dict) -> Tuple[bool, List[str]]:
    """בודק קובץ לפי רשימת בדיקות"""
    issues = []
    
    if not file_path.exists():
        return False, [f'❌ הקובץ {file_path.name} לא קיים!']
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return False, [f'[ERROR] שגיאה בקריאת קובץ: {e}']
    
    # בדיקת IDs
    for req_id in checks.get('required_ids', []):
        if f'id="{req_id}"' not in content and f"id='{req_id}'" not in content:
            issues.append(f'[ERROR] חסר id="{req_id}"')
    
    # בדיקת Scripts
    for script in checks.get('required_scripts', []):
        if f'src="{script}"' not in content:
            issues.append(f'[ERROR] חסר script: {script}')
    
    # בדיקת Functions
    for func in checks.get('required_functions', []):
        # בדיקה גמישה יותר - גם function func וגם func: function
        if not re.search(rf'\b(function\s+{func}|{func}\s*[:=]\s*function|{func}\s*\([^)]*\)\s*{{)', content):
            issues.append(f'[ERROR] חסר function: {func}')
    
    # בדיקת CSS Classes
    for css_class in checks.get('required_css_classes', []):
        if css_class not in content:
            issues.append(f'[ERROR] חסר CSS class: {css_class}')
    
    # בדיקת Strings
    for req_string in checks.get('required_strings', []):
        if req_string not in content:
            issues.append(f'[ERROR] חסר string: {req_string}')
    
    return len(issues) == 0, issues

def check_all_files() -> Tuple[bool, Dict[str, List[str]]]:
    """בודק את כל הקבצים הקריטיים"""
    project_root = Path('.')
    all_ok = True
    all_issues = {}
    
    print("\n" + "="*70)
    print("בודק את כל הקבצים הקריטיים...")
    print("="*70 + "\n")
    
    for file_name, checks in FILE_CHECKS.items():
        file_path = project_root / file_name
        is_ok, issues = check_file(file_path, checks)
        
        if is_ok:
            print(f"[OK] {file_name} - תקין")
        else:
            print(f"[ERROR] {file_name} - נמצאו {len(issues)} בעיות:")
            for issue in issues:
                print(f"   {issue}")
            all_ok = False
            all_issues[file_name] = issues
    
    return all_ok, all_issues

def check_critical_connections():
    """בודק חיבורים קריטיים בין קבצים"""
    print("\n" + "="*70)
    print("בודק חיבורים בין קבצים...")
    print("="*70 + "\n")
    
    issues = []
    project_root = Path('.')
    
    # בדיקה ש-data.js נטען בכל הדפים
    html_files = ['index.html', 'layer.html', 'group.html', 'student.html', 'teacher.html', 'class.html']
    for html_file in html_files:
        html_path = project_root / html_file
        if html_path.exists():
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'data.js' not in content:
                    issues.append(f'[ERROR] {html_file} לא טוען data.js')
                else:
                    print(f"[OK] {html_file} טוען data.js")
    
    # בדיקה ש-auto-load-data.js נטען ב-index.html
    index_path = project_root / 'index.html'
    if index_path.exists():
        with open(index_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'auto-load-data.js' not in content:
                issues.append('[ERROR] index.html לא טוען auto-load-data.js')
            else:
                print("[OK] index.html טוען auto-load-data.js")
    
    return len(issues) == 0, issues

def main():
    """פונקציה ראשית"""
    # הגדרת encoding ל-UTF-8
    import sys
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    
    print("\n" + "="*70)
    print("מנגנון הגנה כללי - בדיקת תקינות המערכת")
    print("="*70)
    
    # בדיקת כל הקבצים
    files_ok, file_issues = check_all_files()
    
    # בדיקת חיבורים
    connections_ok, connection_issues = check_critical_connections()
    
    # סיכום
    print("\n" + "="*70)
    print("סיכום בדיקות")
    print("="*70)
    
    if files_ok and connections_ok:
        print("\n[SUCCESS] כל הבדיקות עברו בהצלחה!")
        print("[SUCCESS] המערכת תקינה - בטוח לבצע שינויים")
        print("\n" + "="*70 + "\n")
        return 0
    else:
        print("\n[ERROR] נמצאו בעיות!")
        if not files_ok:
            print(f"\nבעיות בקבצים ({len(file_issues)} קבצים):")
            for file_name, issues in file_issues.items():
                print(f"   - {file_name}: {len(issues)} בעיות")
        if not connections_ok:
            print(f"\nבעיות בחיבורים ({len(connection_issues)} בעיות):")
            for issue in connection_issues:
                print(f"   {issue}")
        print("\n[WARNING] אל תמשיך לערוך עד שתתקן את הבעיות!")
        print("="*70 + "\n")
        return 1

if __name__ == '__main__':
    sys.exit(main())

