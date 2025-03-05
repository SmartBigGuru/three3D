import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Upload } from "lucide-react";
import type { Project } from "../types";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJExporter } from "three/examples/jsm/exporters/OBJExporter.js";

const API_URL = "https://ae36-38-170-181-10.ngrok-free.app/api";
const baseUrl = "https://ae36-38-170-181-10.ngrok-free.app";

interface ModelFormat {
	name: string;
	extension: string;
	description: string;
}

const MODEL_FORMATS: ModelFormat[] = [
	{
		name: "GLB",
		extension: "glb",
		description: "Binary GL Transmission Format",
	},
	{ name: "FBX", extension: "fbx", description: "Filmbox 3D Format" },
	{ name: "OBJ", extension: "obj", description: "Wavefront 3D Object Format" },
];

// Add this new component for the 3D model
function Model({ url }: { url: string }) {
	const { scene } = useGLTF(url);
	return <primitive object={scene} scale={3} position={[0, 0, 0]} />;
}

interface ProjectViewProps {
	project: Project;
	onBack: () => void;
}

export function ProjectView({ project, onBack }: ProjectViewProps) {
	const [progress, setProgress] = useState(0);
	const [activeImage, setActiveImage] = useState(project.avatar);
	const [showExportDropdown, setShowExportDropdown] = useState(false);
	const [modelGenerated, setModelGenerated] = useState(false);
	const [images, setImages] = useState<string[]>(
		project.thumbnailUrl ? [project.thumbnailUrl] : []
	);
	const [products, setProducts] = useState([]);
	const [uploading, setUploading] = useState<boolean>(false);
	const [modelUrl, setModelUrl] = useState<string | null>(null);
	const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});
	const [isConverting, setIsConverting] = useState<boolean>(false);
	const [conversionProgress, setConversionProgress] = useState<number>(0);
	const [conversionError, setConversionError] = useState<string | null>(null);

	const convertToObj = async (modelUrl: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			const loader = new GLTFLoader();
			type ProgressEvent = {
				loaded: number;
				total: number;
			};

			loader.load(
				modelUrl,
				(gltf) => {
					const scene = gltf.scene;
					const exporter = new OBJExporter();
					const objData = exporter.parse(scene) as string;
					resolve(objData);
				},
				(progress: ProgressEvent) => {
					const percent = Math.round((progress.loaded / progress.total) * 90);
					setConversionProgress(percent);
				},
				reject
			);
		});
	};

	const handleConvertModel = async (format: ModelFormat) => {
		if (!modelUrl) return;

		setIsConverting(true);
		setConversionProgress(0);
		setConversionError(null);

		try {
			const fileName = modelUrl.split("/").pop()?.split("?")[0] || "model";

			let outputData: string | Blob;
			let mimeType: string;

			if (format.extension === "obj") {
				// Convert to OBJ
				const objData = await convertToObj(modelUrl);
				outputData = objData;
				mimeType = "text/plain";
			} else {
				const response = await fetch(modelUrl);

				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}

				// Get the file as a Blob
				const blob = await response.blob();
				console.log("Blob Retrieved:", blob); // Debugging

				outputData = blob;
				// Determine MIME type based on the format
				mimeType =
					format.extension === "glb"
						? "model/gltf-binary"
						: "application/octet-stream";
				console.log("MIME Type:", mimeType); // Debugging
			}

			setConversionProgress(100);

			const blob = new Blob([outputData], { type: mimeType });
			console.log("Generated Blob:", blob); // Debugging

			const url = window.URL.createObjectURL(blob);
			console.log("Generated URL:", url); // Debugging

			const link = document.createElement("a");
			link.href = url;
			link.download = `${fileName.split(".")[0]}.${format.extension}`;
			document.body.appendChild(link);

			// Delay the click to ensure the link is ready
			setTimeout(() => {
				link.click();
				document.body.removeChild(link);
				window.URL.revokeObjectURL(url);
			}, 0);
		} catch (error) {
			console.error("Error converting model:", error);
			setConversionError("Failed to convert model. Please try again.");
		} finally {
			setTimeout(() => {
				setConversionProgress(0);
			}, 1000);
			setIsConverting(false);
			setShowExportDropdown(false);
		}
	};

	const projectBuild = async (data: any) => {
		try {
			console.log("projectbuilddata:", data);
			const result = await axios.post(`${API_URL}/projectbuild`, data);
			console.log("projectbuild: ", result.data); // Log the resolved result
			return result.data; // Return the result so it can be used outside
		} catch (error) {
			console.error("Error in projectBuild:", error); // Handle errors
			throw error; // Re-throw the error so it can be handled by the caller
		}
	};

	const onFinish = async () => {
		try {
			console.log(project);
			const result = await axios.post(`${API_URL}/finishproject`, {
				id: project.id,
			});
			console.log(result);
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		const processProject = async () => {
			console.log("project:", project);
			if (project.state == 0) {
				console.log("--------------", project.id);
				// const filePath = "/uploads/avatar-1738560936134-439623938.jpg";
				const filePath = project.avatar;

				// Extract the file name
				const fileName = project.avatar?.split("/").pop(); // This will get "avatar-1738560936134-439623938.jpg"

				// Determine the MIME type
				let mimeType = "";
				const extension = project.avatar?.split(".").pop(); // This will get "jpg"
				if (extension === "jpg" || extension === "jpeg") {
					mimeType = "image/jpg";
				} else if (extension === "png") {
					mimeType = "image/png";
				} else if (extension === "gif") {
					mimeType = "image/gif";
				} else {
					mimeType = "application/octet-stream"; // Default MIME type if unknown
				}

				try {
					// Simulate a progress bar with intervals
					const interval = setInterval(() => {
						setProgress((prev) => Math.min(prev + 10, 95)); // Increment progress to 95%
					}, 500);

					// Call the projectBuild API
					const data = await projectBuild({
						fileName,
						mimeType,
						filePath,
						id: project.id,
					});

					// Stop the progress interval
					clearInterval(interval);

					// Set the model URL
					setModelUrl(data.tripo3dResponse.output.pbr_model);

					// Update the project status
					await axios.post(`${API_URL}/setStatus`, { id: project.id });

					// Finalize progress to 100% and reset after a timeout
					setProgress(100);
					setTimeout(() => {
						setUploading(false);
						setProgress(0);
					}, 1000);

					console.log("Project build success:", data);
				} catch (error) {
					console.error("Error in projectBuild:", error);
					setUploading(false);
				}
			} else {
				console.log(project.id);
				const result = await axios.post(`${API_URL}/getproducts`, {
					id: project.id,
				});
				setProducts(result.data);
				setModelUrl(result.data[0].threeD);
				console.log(result.data);
			}
		};

		processProject();
	}, []);

	useEffect(() => {
		if (modelUrl) {
			setProgress(100); // Set progress to 100% when model is displayed
			setTimeout(() => {
				setUploading(false); // Mark uploading as finished
				setProgress(0); // Reset progress bar
			}, 1000);
		}
	}, [modelUrl]);

	// useEffect(() => {
	//   if (project?.avatar) {
	//     handleImageUpload(project);
	//   }
	// }, []);

	// useEffect(() => {
	//   console.log(project);
	//   if (uploading) {
	//     const interval = setInterval(() => {
	//       setProgress((prev) => {
	//         if (prev >= 95) {
	//           clearInterval(interval);
	//           return prev;
	//         }
	//         return prev + 5;
	//       });
	//     }, 1000);

	//     return () => clearInterval(interval);
	//   } else if (!uploading && progress > 0) {
	//     setProgress(100);
	//     setTimeout(() => {
	//       setProgress(0);
	//     }, 1000);
	//   }
	// }, [uploading]);

	const handleImageUpload = async (file: File) => {
		setUploading(true);
		setProgress(0);

		try {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("projectId", project.id);

			const response = await axios.post(`${API_URL}/files`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				onUploadProgress: (progressEvent) => {
					if (progressEvent.total) {
						const percentCompleted = Math.round(
							(progressEvent.loaded * 100) / progressEvent.total
						);
						setProgress(percentCompleted);
					}
				},
			});

			if (response.data) {
				// Display the uploaded image immediately
				const uploadedImageUrl = `${baseUrl}${response.data.filePath}`;
				setImages((prev) => [...prev, uploadedImageUrl]); // Add the new image to the state
				setActiveImage((prev) => prev || uploadedImageUrl); // Set the first uploaded image as active (if none is selected)

				// Handle model URL if available in response
				if (response.data.tripo3dResponse?.output?.pbr_model) {
					setModelUrl(response.data.tripo3dResponse.output.pbr_model);
					setDownloadUrls({
						glb: response.data.tripo3dResponse.output.pbr_model,
					});
					setModelGenerated(true);
				}

				console.log("Upload successful:", response.data);
			}
		} catch (error) {
			console.error("Error in file upload:", error);
		} finally {
			setTimeout(() => {
				setProgress(0); // Reset progress after a short delay
			}, 1000);
			setUploading(false);
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			handleImageUpload(file);
		}
	};

	return (
		<div className="max-w-7xl mx-auto">
			<div className="flex items-center mb-6">
				<button
					onClick={onBack}
					className="mr-4 p-2 hover:bg-gray-100 rounded-full"
				>
					<ArrowLeft className="w-5 h-5" />
				</button>
				<div>
					<h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
					<p className="mt-1 text-sm text-gray-500">{project.description}</p>
				</div>
				{project.state == 1 ? (
					<div className="ml-auto">
						<button
							onClick={onFinish}
							className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
						>
							Finish Project
						</button>
					</div>
				) : null}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Source Images */}
				<div className="lg:col-span-1 space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="font-medium text-gray-900">Source Images</h3>
						<span className="text-sm text-gray-500">
							{images.length} images
						</span>
					</div>
					<div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
						{/* {images[activeImage] && project.avatar ? ( */}
						<img
							src={`${baseUrl}${activeImage}`}
							alt="Source"
							className="w-full h-full object-cover rounded-lg"
						/>
						{/* ) : (
              <div className="text-gray-400">No images uploaded</div>
            )} */}
					</div>
					<div className="grid grid-cols-3 gap-2">
						{products.map((img, idx) => (
							<button
								key={idx}
								onClick={() => {
									setActiveImage(img.twoD);
									setModelUrl(img.threeD);
								}}
								className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
									activeImage === idx
										? "border-indigo-600"
										: "border-transparent"
								}`}
							>
								<img
									src={`${baseUrl}${img.twoD}`}
									alt={`Source ${idx + 1}`}
									className="w-full h-full object-cover"
								/>
							</button>
						))}
					</div>

					{/* Upload Button */}
					{project.state == 1 ? (
						<div className="mt-4">
							<label
								htmlFor="image-upload"
								className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md cursor-pointer hover:bg-indigo-700"
							>
								<Upload className="w-5 h-5 mr-2" />
								{uploading ? "Uploading..." : "Upload Image"}
							</label>
							<input
								id="image-upload"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={handleFileChange}
								disabled={uploading}
							/>
						</div>
					) : null}
				</div>
				<div className="lg:col-span-2 space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="font-medium text-gray-900">3D Model</h3>
						{modelUrl && (
							<div className="relative">
								<button
									onClick={() => setShowExportDropdown(!showExportDropdown)}
									className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
								>
									<Download className="w-4 h-4 mr-1.5" />
									Download Model
								</button>

								{showExportDropdown && (
									<div className="absolute right-0 mt-2 w-60 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
										<div className="py-1">
											{MODEL_FORMATS.map((format) => (
												<button
													key={format.extension}
													onClick={() => handleConvertModel(format)}
													disabled={isConverting}
													className={`w-full text-left px-4 py-2 text-sm ${
														isConverting
															? "text-gray-400 cursor-not-allowed"
															: "text-gray-700 hover:bg-gray-100"
													}`}
												>
													<div className="font-medium">{format.name}</div>
													<div className="text-xs text-gray-500">
														{format.description}
													</div>
													{isConverting && conversionProgress > 0 && (
														<div className="mt-1 text-xs text-indigo-600">
															Converting... {conversionProgress}%
														</div>
													)}
												</button>
											))}
											{isConverting && conversionProgress > 0 && (
												<div className="px-4 py-2">
													<div className="h-1 bg-gray-200 rounded-full overflow-hidden">
														<div
															className="h-full bg-indigo-600 transition-all duration-300"
															style={{ width: `${conversionProgress}%` }}
														></div>
													</div>
												</div>
											)}
											{conversionError && (
												<div className="px-4 py-2 text-xs text-red-600">
													{conversionError}
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{progress > 0 && (
						<div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
							<div
								className="h-full bg-indigo-600 transition-all duration-500"
								style={{ width: `${progress}%` }}
							></div>
						</div>
					)}

					<div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
						{modelUrl ? (
							<Canvas
								camera={{ position: [2, 2, 5], fov: 50 }} // Adjusted camera position for a better view
								style={{ width: "100%", height: "100%" }}
							>
								{/* Add balanced lighting */}
								<ambientLight intensity={0.8} />{" "}
								{/* General light to brighten the scene */}
								<directionalLight position={[5, 5, 5]} intensity={1} />{" "}
								{/* A directional light to create shadows */}
								<pointLight position={[-5, -5, -5]} intensity={0.5} />{" "}
								{/* Additional light for softer illumination */}
								{/* Render the model */}
								<Model url={modelUrl} />
								{/* Controls for interaction */}
								<OrbitControls
									enableZoom={true}
									enablePan={true}
									enableRotate={true}
								/>
							</Canvas>
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<div className="text-gray-500">
									{uploading ? "Processing..." : "No 3D model available"}
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
