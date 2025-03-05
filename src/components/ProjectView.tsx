import React, { useState, useEffect } from "react";
import {
	ArrowLeft,
	Cuboid as Cube,
	Download,
	Eye,
	Image as ImageIcon,
	RotateCw,
	ZoomIn,
	ChevronDown,
	Upload,
} from "lucide-react";
import type { Project } from "../types";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Add this new component for the 3D model
function Model({ url }: { url: string }) {
	const { scene } = useGLTF(url);
	return <primitive object={scene} scale={1} position={[0, 0, 0]} />;
}

const apiKey = "tcli_7de49c7d33dc4e1fb9aff135c3855fa4";
const corsProxy = "https://cors-anywhere.herokuapp.com/";
const url = `${corsProxy}https://api.tripo3d.ai/v2/openapi/upload`;

interface ProjectViewProps {
	project: Project;
	onBack: () => void;
}

export function ProjectView({ project, onBack }: ProjectViewProps) {
	const [progress, setProgress] = useState(0);
	const [activeImage, setActiveImage] = useState(0);
	const [showExportDropdown, setShowExportDropdown] = useState(false);
	const [modelGenerated, setModelGenerated] = useState(false);
	const [images, setImages] = useState<string[]>(
		project.thumbnailUrl ? [project.thumbnailUrl] : []
	);
	const [uploading, setUploading] = useState(false);
	const [modelUrl, setModelUrl] = useState<string | null>(null);

	const exportFormats = [
		{
			name: "GLB",
			description: "Binary GL Transmission Format",
			size: "2.4 MB",
		},
		{ name: "FBX", description: "Filmbox 3D Format", size: "3.1 MB" },
		{ name: "OBJ", description: "Wavefront 3D Object Format", size: "1.8 MB" },
	];

	useEffect(() => {
		if (project.status === "processing") {
			const interval = setInterval(() => {
				setProgress((prev) => {
					const newProgress = prev + 2;
					if (newProgress >= 100) {
						setModelGenerated(true);
						clearInterval(interval);
						return newProgress;
					}
					return newProgress;
				});
			}, 300);

			return () => clearInterval(interval);
		}
	}, [project.status]);

	const handleExport = (format: (typeof exportFormats)[0]) => {
		console.log(`Downloading ${format.name} format`);
		setShowExportDropdown(false);
	};

	const handleImageUpload = async (file: File) => {
		setUploading(true);
		try {
			const formData = new FormData();
			formData.append("file", file);

			const response = await axios.post(
				"https://ae36-38-170-181-10.ngrok-free.app/api/files",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data) {
				setImages((prev) => [...prev, URL.createObjectURL(file)]);
				if (response.data.tripo3dResponse?.output?.pbr_model) {
					console.log(response.data.tripo3dResponse.output.pbr_model);
					setModelUrl(response.data.tripo3dResponse.output.pbr_model);
					setModelGenerated(true);
				}
				console.log("Upload successful:", response.data);
			}
		} catch (error) {
			console.error("Error in file upload:", error);
		} finally {
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
						{images[activeImage] ? (
							<img
								src={images[activeImage]}
								alt="Source"
								className="w-full h-full object-cover rounded-lg"
							/>
						) : (
							<div className="text-gray-400">No images uploaded</div>
						)}
					</div>
					<div className="grid grid-cols-3 gap-2">
						{images.map((img, idx) => (
							<button
								key={idx}
								onClick={() => setActiveImage(idx)}
								className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
									activeImage === idx
										? "border-indigo-600"
										: "border-transparent"
								}`}
							>
								<img
									src={img}
									alt={`Source ${idx + 1}`}
									className="w-full h-full object-cover"
								/>
							</button>
						))}
					</div>

					{/* Upload Button */}
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
				</div>

				{/* 3D Model Viewer */}
				{/* <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">3D Model</h3>
            {(project.status === 'completed' || modelGenerated) && (
              <div className="relative">
                <button
                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  <Download className="w-4 h-4 mr-1.5" />
                  Export Model
                  <ChevronDown className="w-4 h-4 ml-1.5" />
                </button>
                {showExportDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      {exportFormats.map((format) => (
                        <button
                          key={format.name}
                          onClick={() => handleExport(format)}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-medium text-gray-900">{format.name}</span>
                            <p className="text-sm text-gray-500">{format.description}</p>
                          </div>
                          <span className="text-sm text-gray-500">{format.size}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          {project.status === 'processing' && !modelGenerated ? (
            <div className="space-y-4">
              <div className="h-[400px] bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                <Cube className="w-16 h-16 text-indigo-600 animate-pulse mb-4" />
                <div className="text-gray-600 font-medium">Generating 3D Model...</div>
                <div className="text-sm text-gray-500 mt-1">This may take a few minutes</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-sm text-gray-600 text-center">
                {progress}% Complete
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="h-[400px] bg-gray-100 rounded-lg flex items-center justify-center">
                <div
                  className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg relative overflow-hidden"
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      animation: 'rotate 20s linear infinite',
                    }}
                  >
                    <div
                      className="w-48 h-48 bg-indigo-500/30 rounded-lg"
                      style={{
                        transform: 'rotateX(45deg) rotateY(45deg)',
                        boxShadow: '0 0 40px rgba(99, 102, 241, 0.3)',
                      }}
                    />
                  </div>
                  <style>
                    {`
                      @keyframes rotate {
                        from { transform: rotateY(0deg); }
                        to { transform: rotateY(360deg); }
                      }
                    `}
                  </style>
                </div>
              </div>
              

              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg px-4 py-2 flex space-x-4">
                <button className="p-2 hover:bg-gray-100 rounded-full" title="Rotate">
                  <RotateCw className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full" title="Zoom">
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-full" title="View Mode">
                  <Eye className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div> */}
				<div className="lg:col-span-2 space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="font-medium text-gray-900">3D Model</h3>
						{modelGenerated && modelUrl && (
							<a
								href={modelUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
							>
								<Download className="w-4 h-4 mr-1.5" />
								Download Model
							</a>
						)}
					</div>

					<div className="h-[400px] bg-gray-100 rounded-lg overflow-hidden">
						{modelUrl ? (
							<Canvas
								camera={{ position: [0, 0, 5], fov: 50 }}
								style={{ width: "100%", height: "100%" }}
							>
								<ambientLight intensity={0.5} />
								<pointLight position={[10, 10, 10]} intensity={1} />
								<Model url={modelUrl} />
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

					{/* Controls */}
					{modelUrl && (
						<div className="flex justify-center space-x-4">
							<button
								className="p-2 hover:bg-gray-100 rounded-full"
								title="Rotate"
							>
								<RotateCw className="w-5 h-5 text-gray-600" />
							</button>
							<button
								className="p-2 hover:bg-gray-100 rounded-full"
								title="Zoom"
							>
								<ZoomIn className="w-5 h-5 text-gray-600" />
							</button>
							<button
								className="p-2 hover:bg-gray-100 rounded-full"
								title="View Mode"
							>
								<Eye className="w-5 h-5 text-gray-600" />
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
