import zipfile
import os

def create_source_zip(output_filename):
    # Root-level config files to include
    include_files = [
        "index.html", "package.json",
        "package-lock.json", "tsconfig.json", "vite.config.js",
        "tailwind.config.js", "postcss.config.js"
    ]
    # Directories to include
    include_dirs = ["src", "extension", "scripts"]

    # SECURITY: Use relative path to avoid exposing user info or hardcoded paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(base_dir)
    output_path = os.path.join(project_root, output_filename)

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add individual files
        for f in include_files:
            file_path = os.path.join(project_root, f)
            if os.path.exists(file_path):
                zipf.write(file_path, arcname=f)

        # Add directories with forward slash enforcement
        for d in include_dirs:
            dir_path = os.path.join(project_root, d)
            if os.path.exists(dir_path):
                for root, dirs, files in os.walk(dir_path):
                    # Exclude hidden directories
                    dirs[:] = [d for d in dirs if d not in ['.git', '__pycache__', '.idea', '.vscode', 'node_modules']]

                    for file in files:
                        # Exclude build artifacts and system files
                        if file.endswith(('.zip', '.DS_Store')):
                            continue

                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, project_root)
                        # CRITICAL: Force forward slashes for cross-platform compatibility
                        arcname = rel_path.replace(os.path.sep, '/')
                        zipf.write(full_path, arcname)

    print(f"Successfully created source zip: {output_path}")

if __name__ == "__main__":
    create_source_zip("terminal-start-source-v1.0.0.zip")
