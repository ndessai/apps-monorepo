#!/usr/bin/env ruby
require 'xcodeproj'

project_path = 'QuizApp.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main target
target = project.targets.find { |t| t.name == 'QuizApp' }

# Find or create Resources group at root level
resources_group = project.main_group['Resources']
if resources_group.nil?
  resources_group = project.main_group.new_group('Resources')
end

# Get the Resources build phase
resources_build_phase = target.resources_build_phase

# Clear existing font references to avoid duplicates
resources_build_phase.files.each do |file|
  if file.file_ref && file.file_ref.path && file.file_ref.path.end_with?('.ttf')
    resources_build_phase.remove_file_reference(file.file_ref)
  end
end

# Remove existing font file references from groups
resources_group.files.each do |file|
  file.remove_from_project if file.path && file.path.end_with?('.ttf')
end

# Add font files
font_files = Dir.glob('*.ttf')
font_files.each do |font_name|
  # Add file reference to Resources group
  file_ref = resources_group.new_reference(font_name)
  file_ref.last_known_file_type = 'file'
  file_ref.source_tree = '<group>'

  # Add to resources build phase
  build_file = resources_build_phase.add_file_reference(file_ref)

  puts "Added #{font_name} to project"
end

project.save

puts "\n✅ Font files successfully linked to Xcode project!"
puts "Total fonts: #{font_files.count}"
