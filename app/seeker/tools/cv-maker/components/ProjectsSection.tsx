import React from 'react';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Project {
  id: number;
  title: string;
  role: string;
  startDate: string;
  endDate: string;
  description: string;
  url: string;
}

interface ProjectsSectionProps {
  projects: Project[];
  onProjectChange: (index: number, field: string, value: string) => void;
  onAddProject: () => void;
  onRemoveProject: (index: number) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  onProjectChange,
  onAddProject,
  onRemoveProject
}) => {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-4">
        List significant projects that showcase your skills and expertise. These can include personal projects, 
        academic work, open-source contributions, or professional projects.
      </p>
      
      {projects.map((project, index) => (
        <div key={project.id} className="mb-6">
          {index > 0 && <div className="border-t border-gray-200 my-6"></div>}
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-800">Project {index + 1}</h4>
            {projects.length > 1 && (
              <button 
                type="button" 
                className="p-1 text-red-600 hover:bg-red-50 rounded"
                onClick={() => onRemoveProject(index)}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Title*</label>
              <input
                type="text"
                value={project.title}
                onChange={(e) => onProjectChange(index, 'title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="e.g. E-commerce Website, Research Paper"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
              <input
                type="text"
                value={project.role}
                onChange={(e) => onProjectChange(index, 'role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
                placeholder="e.g. Lead Developer, Researcher"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={project.startDate}
                onChange={(e) => onProjectChange(index, 'startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={project.endDate}
                onChange={(e) => onProjectChange(index, 'endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Project URL (Optional)</label>
            <input
              type="url"
              value={project.url}
              onChange={(e) => onProjectChange(index, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              placeholder="https://..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description*</label>
            <textarea
              value={project.description}
              onChange={(e) => onProjectChange(index, 'description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-olive-light"
              placeholder="Describe the project, your responsibilities, technologies used, and outcomes achieved."
              rows={4}
              required
            ></textarea>
          </div>
        </div>
      ))}
      
      <button 
        type="button" 
        className="mt-2 flex items-center text-olive-dark hover:text-olive-medium"
        onClick={onAddProject}
      >
        <PlusIcon className="w-5 h-5 mr-1" />
        <span>Add Another Project</span>
      </button>
    </div>
  );
};

export default ProjectsSection; 