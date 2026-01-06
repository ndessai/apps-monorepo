#!/usr/bin/env ruby
require 'xcodeproj'

project_path = 'BoilerplateApp.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main target
target = project.targets.find { |t| t.name == 'BoilerplateApp' }

# Find or create the Fonts group
fonts_group = project.main_group.find_subpath('BoilerplateApp/Fonts', true)

# Get the Resources build phase
resources_build_phase = target.resources_build_phase

# Add font files
font_files = Dir.glob('BoilerplateApp/Fonts/*.ttf')
font_files.each do |font_path|
  font_name = File.basename(font_path)

  # Check if file reference already exists
  existing_ref = fonts_group.files.find { |f| f.path == font_name }

  unless existing_ref
    # Add file reference
    file_ref = fonts_group.new_reference(font_name)
    file_ref.last_known_file_type = 'file'
    file_ref.source_tree = '<group>'

    # Add to resources build phase if not already there
    unless resources_build_phase.files_references.include?(file_ref)
      resources_build_phase.add_file_reference(file_ref)
      puts "Added #{font_name} to project"
    end
  end
end

project.save

puts "Font files successfully added to Xcode project!"
