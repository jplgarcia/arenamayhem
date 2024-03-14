import os

# Specify the folder path where your .png files are located
folder_path = "C:/Users/John/OneDrive/Desktop/Arena Mayhem/img/sword"

# String to remove from the file names
string_to_remove = "Knight_03__"

# List all files in the folder
file_list = os.listdir(folder_path)

# Iterate through the files and rename them
for file_name in file_list:
    if file_name.endswith(".png") and string_to_remove in file_name:
        # Create the new file name by removing the specified string
        new_file_name = file_name.replace(string_to_remove, "")
        
        # Full path to the old and new file
        old_file_path = os.path.join(folder_path, file_name)
        new_file_path = os.path.join(folder_path, new_file_name)
        
        # Rename the file
        os.rename(old_file_path, new_file_path)
        print(f"Renamed: {file_name} to {new_file_name}")