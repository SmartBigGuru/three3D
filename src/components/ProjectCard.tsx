import { Project } from "../types";
import { Clock, Image as ImageIcon, Trash2 as TrashIcon } from "lucide-react";

interface ProjectCardProps {
	project: Project;
	onClick: () => void;
	onDelete: () => void;
}

export function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
	const baseUrl = "https://ae36-38-170-181-10.ngrok-free.app";
	console.log(project);
	return (
		<div
			onClick={onClick}
			className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
		>
			<div className="aspect-video relative bg-gray-100 rounded-t-lg overflow-hidden">
				{project.avatar ? (
					<img
						src={`${baseUrl}${project.avatar}`}
						alt={project.name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div className="absolute inset-0 flex items-center justify-center">
						<ImageIcon className="w-12 h-12 text-gray-400" />
					</div>
				)}
				<div className="absolute top-2 right-2">
					{/* <span
            className={`
              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${
                project.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'processing'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }
            `}
          >
            `{project.status == 0 ? 'processing' : 'completed'}`
          </span> */}
					<button
						onClick={(e) => {
							e.stopPropagation(); // Prevent triggering the card's onClick
							onDelete(); // Call the onDelete handler
						}}
						className="text-gray-500 hover:text-red-500"
					>
						<TrashIcon className="w-5 h-5" />
					</button>
				</div>
			</div>
			<div className="p-4">
				<h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
				<p className="mt-1 text-sm text-gray-500">{project.description}</p>
				<div className="mt-4 flex items-center text-sm text-gray-500">
					<Clock className="w-4 h-4 mr-1" />
					{new Date(project.createdAt).toLocaleDateString()}
				</div>
			</div>
		</div>
	);
}
