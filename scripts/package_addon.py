import zipfile
import os

def create_extension_zip(source_dir, output_filename):
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(source_dir):
            # Exclude hidden directories
            dirs[:] = [d for d in dirs if d not in ['.git', '__pycache__', '.idea', '.vscode']]

            for file in files:
                # Exclude build artifacts and system files
                if file.endswith(('.zip', '.DS_Store')):
                    continue

                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, source_dir)
                arcname = arcname.replace(os.path.sep, '/')
                zipf.write(file_path, arcname)
    print(f"Successfully created {output_filename}")

# Paths
base_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(base_dir)
extension_dir = os.path.join(project_root, "extension")
output_zip = os.path.join(project_root, "terminal-start-v1.0.0.zip")

if __name__ == "__main__":
    if os.path.exists(output_zip):
        os.remove(output_zip)
    create_extension_zip(extension_dir, output_zip)
