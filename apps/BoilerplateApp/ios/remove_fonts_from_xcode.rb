#!/usr/bin/env ruby
require 'xcodeproj'

project_path = 'BoilerplateApp.xcodeproj'
project = Xcodeproj::Project.open(project_path)

# Find the main target
target = project.targets.find { |t| t.name == 'BoilerplateApp' }

# Get the Resources build phase
resources_build_phase = target.resources_build_phase

# Remove all .ttf file references from the Resources build phase
removed_count = 0
resources_build_phase.files.to_a.each do |build_file|
  if build_file.file_ref && build_file.file_ref.path && build_file.file_ref.path.end_with?('.ttf')
    file_path = build_file.file_ref.path
    resources_build_phase.remove_file_reference(build_file.file_ref)
    puts "Removed #{file_path} from Resources build phase"
    removed_count += 1
  end
end

# Remove font file references from all groups
project.main_group.recursive_children.each do |item|
  if item.is_a?(Xcodeproj::Project::Object::PBXFileReference) && item.path && item.path.end_with?('.ttf')
    item.remove_from_project
    puts "Removed #{item.path} from project groups"
  end
end

project.save

puts "\n✅ Removed #{removed_count} font file references from Xcode project"
puts "Fonts will now be managed by react-native-asset and CocoaPods only"
