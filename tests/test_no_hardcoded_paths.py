import os
import re
import sys

def check_file(filepath):
    """
    Checks if a Python file contains hardcoded absolute paths or usernames.
    """
    issues = []
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Regex patterns to detect hardcoded paths
    # Matches 'C:\Users', '/home/user', or specific 'Straightheart'
    patterns = [
        (re.compile(r'c:\\Users', re.IGNORECASE), "Windows User Path"),
        (re.compile(r'Straightheart', re.IGNORECASE), "Specific Username"),
        (re.compile(r'/home/[a-z]+', re.IGNORECASE), "Linux Home Path"),
        # More specific Windows drive pattern to avoid false positives in valid strings if any
        (re.compile(r'[a-zA-Z]:\\[^ \t\n\r\f\v"\']*'), "Absolute Windows Path"),
    ]

    for i, line in enumerate(lines):
        line = line.strip()
        # Skip comments? Maybe not strictly necessary if we want to be paranoid
        if line.startswith('#'):
            continue

        for pattern, desc in patterns:
            if pattern.search(line):
                # Filter out intentional strings if they are part of a library call?
                # For now, let's keep it strict.
                issues.append(f"Line {i+1}: {desc} found: {line}")

    return issues

def main():
    # Assume script is run from project root or inside tests/
    # We want to scan files in the root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir) # If script is in tests/

    # Fallback if run from root
    if not os.path.basename(script_dir) == 'tests':
        project_root = script_dir

    target_files = ['package_source.py', 'package_addon.py']

    all_clean = True

    for filename in target_files:
        filepath = os.path.join(project_root, filename)
        if not os.path.exists(filepath):
            # If we are in root, try direct access
            if os.path.exists(filename):
                filepath = filename
            else:
                print(f"ERROR: Target file {filename} not found!")
                all_clean = False
                continue

        print(f"Scanning {filename}...")
        issues = check_file(filepath)

        if issues:
            all_clean = False
            print(f"FAIL: {filename} has potential hardcoded paths:")
            for issue in issues:
                print(f"  - {issue}")
        else:
            print(f"PASS: {filename} is clean.")

    if not all_clean:
        sys.exit(1)

    print("\nAll checks passed successfully.")

if __name__ == "__main__":
    main()
