import zipfile
import os

def create_source_zip(output_filename):
    # Files and folders to include in the source zip
    include_files = [
        "App.tsx", "index.tsx", "index.css", "index.html", 
        "constants.ts", "types.ts", "package.json", 
        "package-lock.json", "tsconfig.json", "vite.config.js", 
        "tailwind.config.js", "postcss.config.js", "package_addon.py"
    ]
    include_dirs = ["components", "extension"]

    # SECURITY: Use relative path to avoid exposing user info or hardcoded paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(base_dir, output_filename)

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add individual files
        for f in include_files:
            file_path = os.path.join(base_dir, f)
            if os.path.exists(file_path):
                zipf.write(file_path, arcname=f) # Simple filenames don't have slashes

        # Add directories with forward slash enforcement
        for d in include_dirs:
            dir_path = os.path.join(base_dir, d)
            if os.path.exists(dir_path):
                for root, dirs, files in os.walk(dir_path):
                    # Exclude hidden directories
                    dirs[:] = [d for d in dirs if d not in ['.git', '__pycache__', '.idea', '.vscode', 'node_modules']]

                    for file in files:
                        # Exclude build artifacts and system files
                        if file.endswith(('.zip', '.DS_Store')):
                            continue

                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, base_dir)
                        # CRITICAL: Force forward slashes for cross-platform compatibility
                        arcname = rel_path.replace(os.path.sep, '/')
                        zipf.write(full_path, arcname)

    print(f"Successfully created source zip: {output_path}")

if __name__ == "__main__":
    create_source_zip("terminal-start-source-v1.0.0.zip")
