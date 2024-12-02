from os import path, PathLike, walk
from sys import argv

def get_imports(file: PathLike) -> list:
    """
    Get a list of imports from a file.

    **Args:**
    
        **file (PathLike):** The path to the file to read.

    **Returns:**
    
        A `list` of imports from the file.
    """

    imports = []

    with open(file, 'r') as f:
        for line in f:
            if line.startswith('const'):
                break
            if line.startswith('import'):
                cleaned_import = line.replace('import ', '').replace('{', '').replace('}', '').split('from')[0].strip()
                imports.extend([item.strip() for item in cleaned_import.split(',')])

    return imports
    
def get_intrafaces(file: PathLike) -> list:
    """
    Get a list of intrafaces from a file.

    :Args:
    :
        :file (PathLike): The path to the file to read.

    :Returns:
    :
        :list: A list of intrafaces from the file.
    """

    with open(file, 'r') as f:
        return [line.replace('export intraface', '').replace('export type', '').split('{')[0].strip() for line in f if any(k in line for k in ['export intraface', 'export type'])]
    
def get_all_imports(folder: PathLike) -> dict:
    """
    Get a dictionary of imports from a folder.

    :Args:
    :
        :folder (PathLike): The path to the folder to read.

    :Returns:
    :
        :dict: A dictionary where keys are file names and values are lists of imports.
    """

    imports = {}

    for root, _, files in walk(folder):
        for file in files:
            if file.endswith(('.ts', '.tsx')):
                imports[file] = get_imports(path.join(root, file))
    
    return imports

def get_all_intrafaces(folder: PathLike) -> dict:
    """
    Get a dictionary of intrafaces from a folder.

    :Args:
    :
        :folder (PathLike): The path to the folder to read.

    :Returns:
    :
        :dict: A dictionary where keys are file names and values are lists of intrafaces.
    """

    intrafaces = {}

    for root, _, files in walk(folder):
        for file in files:
            if file.endswith('.ts'):
                intrafaces[file] = get_intrafaces(path.join(root, file))

    return intrafaces

def get_all_components(folder: PathLike) -> list:
    """
    Get a dictionary of components from a folder.

    :Args:
    :
        :folder (PathLike): The path to the folder to read.

    :Returns:
    :
        :dict: A dictionary where keys are file names and values are lists of components.
    """

    components = []

    for _, _, files in walk(folder):
        for file in files:
            if file.endswith('.tsx'):
                components.append(file.split('.')[0])

    return components

def check_if_intraface_is_used(intraface: str, imports: dict) -> bool:
    """
    Check if an intraface is used in any of the imports.

    :Args:
    :
        :intraface (str): The intraface to check.

    :Returns:
    :
        :bool: True if the intraface is used, False otherwise.
    """

    for file in imports:
        for import_list in imports[file]:
            if intraface in import_list:
                return True

    return False

def check_all_intrafaces(intrafaces: dict, imports: dict) -> list:
    """
    Check if all intrafaces are used in any of the imports.

    :Args:
    :
        :intrafaces (dict): A dictionary where keys are file names and values are lists of intrafaces.

    :Returns:
    :
        :list: A list of unused intrafaces.
    """

    unused_intrafaces = []

    for file in intrafaces:
        for intraface in intrafaces[file]:
            if not check_if_intraface_is_used(intraface, imports):
                unused_intrafaces.append(intraface)

    return unused_intrafaces

def check_if_component_is_used(component: str, imports: dict) -> bool:
    """
    Check if a component is used in any of the imports.

    :Args:
    :
        :component (str): The component to check.

    :Returns:
    :
        :bool: True if the component is used, False otherwise.
    """

    for file in imports:
        for import_list in imports[file]:
            if component in import_list:
                return True

    return False

def check_all_components(components: list, imports: dict) -> list:
    """
    Check if all components are used in any of the imports.

    :Args:
    :
        :components (list): A list of components.

    :Returns:
    :
        :list: A list of unused components.
    """
    return [c for c in components if not check_if_component_is_used(c, imports)]

def write_unused_intrafaces_and_components(unused_intrafaces: list, unused_components: list, output_file: PathLike) -> None:
    """
    Write unused intrafaces to a file.

    :Args:
    :
        :unused_intrafaces (list): A list of unused intrafaces.

    :Returns:
    :
        :None
    """

    with open(output_file, 'w') as f:
        f.write('Unused intrafaces:\n')
        for intraface in unused_intrafaces:
            f.write(f'{intraface}\n')
        f.write('\nUnused components:\n')
        for component in unused_components:
            f.write(f'{component}\n')

def main():
    project = argv[1]
    
    imports = get_all_imports(path.join(project, 'src'))
    
    intrafaces = get_all_intrafaces(path.join(project, 'src'))
    
    components = get_all_components(path.join(project, 'src'))
    
    unused_intrafaces = check_all_intrafaces(intrafaces, imports)
    
    unused_components = check_all_components(components, imports)

    write_unused_intrafaces_and_components(unused_intrafaces, unused_components, path.join(project, 'unused_intrafaces.txt'))

if __name__ == "__main__":
    if len(argv) != 2:
        print("Usage: python importi.py <project_folder>")
        exit(1)
    main()