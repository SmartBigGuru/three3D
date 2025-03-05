import React, { useEffect, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { Layout } from "./components/Layout";
import { ProjectCard } from "./components/ProjectCard";
import type { Project } from "./types";
import { ProjectView } from "./components/ProjectView";
import axios from "axios";

const API_URL = "https://ae36-38-170-181-10.ngrok-free.app/api";
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "36400";

function App() {
	const [showNewProject, setShowNewProject] = React.useState(false);
	const [selectedProject, setSelectedProject] = useState<Project | null>(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		images: [] as File[],
		previewUrls: [] as string[],
	});
	const [projects, setProjects] = useState<Project[]>([]);
	const [deleteState, setDeleteState] = useState(0);

	// Add a new state for refreshing the dashboard
	const [refreshCount, setRefreshCount] = useState(0);

	const handleCreateProject = async (e: React.FormEvent) => {
		e.preventDefault();
		const now = new Date();
		const idTime = now.getTime();

		console.log(formData.images[0]);
		// Create FormData to send file
		const formDataToSend = new FormData();
		formDataToSend.append("id", String(idTime));
		formDataToSend.append("name", formData.name);
		formDataToSend.append("description", formData.description);

		// If we have a file, append it
		if (formData) {
			formDataToSend.append("avatar", formData.images[0]);
		}

		console.log(formDataToSend);

		const result = await axios.post(
			`${API_URL}/createProject`,
			formDataToSend,
			{
				headers: {
					"Content-Type": "multipart/form-data",
					"ngrok-skip-browser-warning": "any-value",
					"User-Agent": "Custom-Client",
				},
			}
		);

		if (result.data) {
			setShowNewProject(false);
			setFormData({ name: "", description: "", images: [], previewUrls: [] });
			setSelectedProject(result.data.project);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files);
			console.log(files[0]);
			const urls = files.map((file) => URL.createObjectURL(file));
			setFormData((prev) => ({
				...prev,
				images: files,
				previewUrls: urls,
				avatar: files[0],
			}));
		}
	};

	const fetchData = async () => {
		try {
			const result = await axios.post(`${API_URL}/getproject`, {
				type: "upload",
				headers: {
					"ngrok-skip-browser-warning": true,
					"User-Agent": "Custom-Client",
				},
			});
			if (result.data) {
				const mappedProjects = result.data.map((item: any) => ({
					id: item.id,
					name: item.name || "",
					description: item.description || "",
					createdAt: new Date(item.createdAt || new Date()),
					status: item.status || 0,
					avatar: item.avatar || item.thumbnailUrl,
					file: item.file,
					thumbnailUrl: item.avatar,
				}));
				setProjects(mappedProjects);
				console.log(result.data);
			}
		} catch (error) {
			if (error) {
				console.log("Request canceled");
			} else {
				console.error("Error fetching data:", error);
			}
		}
	};

	const deleteProject = async (project: any) => {
		console.log(project);
		await axios
			.post(`${API_URL}/deleteproject`, project)
			.then((result) => {
				console.log(result);
				setDeleteState(deleteState + 1);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const projectId = urlParams.get("project"); // Get project ID from URL

		if (projectId) {
			const project = projects.find((p) => p.id === parseInt(projectId, 10));
			if (project) {
				setSelectedProject(project);
			}
		}
	}, [projects]);

	// Update fetchData when refreshCount or deleteState changes
	useEffect(() => {
		fetchData();
	}, [refreshCount, deleteState]);

	return (
		<Layout>
			{selectedProject ? (
				<ProjectView
					project={selectedProject}
					// On back, refresh the dashboard and go back to the dashboard
					onBack={() => {
						window.history.pushState({}, "", "/");
						setSelectedProject(null);
						setRefreshCount((prev) => prev + 1); // Trigger a refresh
					}}
				/>
			) : (
				<div className="max-w-7xl mx-auto">
					<div className="flex justify-between items-center mb-6">
						<div>
							<h2 className="text-2xl font-bold text-gray-900">Projects</h2>
							<p className="mt-1 text-sm text-gray-500">
								Manage your 3D model generation projects
							</p>
						</div>
						<button
							onClick={() => setShowNewProject(true)}
							className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
						>
							<Plus className="w-4 h-4 mr-2" />
							New Project
						</button>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{projects.map((project) => (
							<ProjectCard
								key={project.id}
								project={project}
								onClick={() => {
									setSelectedProject(project);
									window.history.pushState({}, "", `?project=${project.id}`); // Update URL with project ID
								}}
								onDelete={() => deleteProject(project)}
							/>
						))}
					</div>

					{/* New Project Modal */}
					{showNewProject && (
						<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
							<div className="bg-white rounded-lg max-w-md w-full p-6">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Create New Project
								</h3>
								<form className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Project Name
										</label>
										<input
											type="text"
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											placeholder="Enter project name"
											value={formData.name}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Description
										</label>
										<textarea
											className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											rows={3}
											placeholder="Enter project description"
											value={formData.description}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													description: e.target.value,
												}))
											}
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700">
											Upload Images
										</label>
										<div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
											<div className="space-y-1 text-center">
												{formData.previewUrls.length > 0 ? (
													<div className="space-y-4">
														<div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
															<img
																src={formData.previewUrls[0]}
																alt="Preview"
																className="w-full h-full object-cover"
															/>
														</div>
														<div className="grid grid-cols-4 gap-2">
															{formData.previewUrls.map((url, idx) => (
																<div
																	key={idx}
																	className="aspect-square rounded-lg overflow-hidden border border-gray-200"
																>
																	<img
																		src={url}
																		alt={`Preview ${idx + 1}`}
																		className="w-full h-full object-cover"
																	/>
																</div>
															))}
														</div>
														<div className="flex justify-center">
															<label className="cursor-pointer text-sm font-medium text-indigo-600 hover:text-indigo-500">
																<span>Change Images</span>
																<input
																	type="file"
																	multiple
																	className="sr-only"
																	accept="image/*"
																	onChange={handleFileChange}
																/>
															</label>
														</div>
													</div>
												) : (
													<>
														<Upload className="mx-auto h-12 w-12 text-gray-400" />
														<div className="flex text-sm text-gray-600">
															<label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
																<span>Upload files</span>
																<input
																	type="file"
																	multiple
																	className="sr-only"
																	accept="image/*"
																	onChange={handleFileChange}
																/>
															</label>
															<p className="pl-1">or drag and drop</p>
														</div>
													</>
												)}
												<p className="text-xs text-gray-500">
													PNG, JPG up to 10MB each
												</p>
											</div>
										</div>
									</div>
									<div className="flex justify-end space-x-3">
										<button
											type="button"
											onClick={() => setShowNewProject(false)}
											className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md"
										>
											Cancel
										</button>
										<button
											type="submit"
											onClick={handleCreateProject}
											className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
										>
											Create Project
										</button>
									</div>
								</form>
							</div>
						</div>
					)}
				</div>
			)}
		</Layout>
	);
}

export default App;
