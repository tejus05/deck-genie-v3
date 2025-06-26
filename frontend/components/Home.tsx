"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Info, ExternalLink, PlayCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { getEnv } from "@/utils/constant";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface ModelOption {
    value: string;
    label: string;
    description?: string;
}

interface ProviderConfig {
    textModels: ModelOption[];
    imageModels: ModelOption[];
    apiGuide: {
        title: string;
        steps: string[];
        videoUrl?: string;
        docsUrl: string;
    };
}

const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
    google: {
        textModels: [
            {
                value: "gemini-pro",
                label: "Gemini Pro",
                description: "Balanced model for most tasks",
            },
        ],
        imageModels: [
            {
                value: "imagen",
                label: "Imagen",
                description: "Google's primary image generation model",
            },
        ],
        apiGuide: {
            title: "How to get your Google AI Studio API Key",
            steps: [
                "Visit aistudio.google.com",
                'Click on "Get API key" in the top navigation',
                'Click "Create API key" on the next page',
                'Choose either "Create API Key in new Project" or select an existing project',
                "Copy your API key - you're ready to go!",
            ],
            videoUrl: "https://www.youtube.com/watch?v=o8iyrtQyrZM&t=66s",
            docsUrl: "https://aistudio.google.com/app/apikey",
        },
    },
};

interface ConfigState {
    provider: string;
    apiKey: string;
    textModel: string;
    imageModel: string;
}

export default function Home() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [config, setConfig] = useState<ConfigState>({
        provider: "google",
        apiKey: "",
        textModel: PROVIDER_CONFIGS.google.textModels[0].value,
        imageModel: PROVIDER_CONFIGS.google.imageModels[0].value,
    });

    useEffect(() => {
        const checkExistingConfig = async () => {
            try {
                const env = getEnv();
                const response = await fetch(`${env.BASE_URL}/config/`);
                if (response.ok) {
                    const savedConfig = await response.json();
                    
                    // If Google API key exists, redirect to upload
                    if (savedConfig?.GOOGLE_API_KEY) {
                        router.push('/upload');
                    } else {
                        setIsLoading(false);
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (error) {
                console.error("Error checking config:", error);
                setIsLoading(false);
            }
        };

        checkExistingConfig();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b font-instrument_sans from-gray-50 to-white flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading configuration...</p>
                </div>
            </div>
        );
    }

    const handleConfigChange = (
        field: keyof ConfigState,
        value: string | number
    ) => {
        setConfig((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const currentProvider = PROVIDER_CONFIGS[config.provider];
    const handleSaveConfig = async () => {
        if (!config.apiKey) {
            toast({
                title: "Error",
                description: "Please enter an API key",
            });
            return;
        }

        try {
            const env = getEnv();
            const configData = {
                LLM: "google", // Always use Google since we removed OpenAI
                GOOGLE_API_KEY: config.apiKey
            };

            const response = await fetch(`${env.BASE_URL}/config/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(configData),
            });

            if (response.ok) {
                toast({
                    title: "Configuration saved",
                    description: "You can now upload your presentation",
                });
                router.push("/upload");
            } else {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to save configuration');
            }
        } catch (error) {
            console.error('Error saving configuration:', error);
            toast({
                title: "Error",
                description: "Failed to save configuration",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b font-instrument_sans from-gray-50 to-white">
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                {/* Branding Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <img src="/Logo.png" alt="DeckGenie Logo" className="" />
                    </div>
                    <p className="text-gray-600 text-lg">
                        Open-source AI presentation generator
                    </p>
                </div>

                {/* Main Configuration Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    {/* Provider Info */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <span className="text-blue-700 font-semibold text-lg">Google AI</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">
                            Using Google Gemini for AI-powered presentation generation
                        </p>
                    </div>

                    {/* API Key Input */}
                    <div className="mb-8">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {config.provider.charAt(0).toUpperCase() +
                                config.provider.slice(1)}{" "}
                            API Key
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={config.apiKey}
                                onChange={(e) => handleConfigChange("apiKey", e.target.value)}
                                className="w-full px-4 py-2.5 outline-none border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                placeholder="Enter your API key"
                            />
                        </div>
                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
                            <span className="block w-1 h-1 rounded-full bg-gray-400"></span>
                            Your API key will be stored locally and never shared
                        </p>
                    </div>

                    {/* Model Information */}
                    <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                            <div>
                                <h3 className="text-sm font-medium text-blue-900 mb-1">
                                    Selected Models
                                </h3>
                                <p className="text-sm text-blue-700">
                                    Using {currentProvider.textModels[0].label} for text
                                    generation and {currentProvider.imageModels[0].label} for
                                    images
                                </p>
                                <p className="text-sm text-blue-600 mt-2 opacity-75">
                                    We've pre-selected the best models for optimal presentation
                                    generation
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* API Guide Section */}
                    <Accordion type="single" collapsible className="mb-8 bg-gray-50 rounded-lg border border-gray-200">
                        <AccordionItem value="guide" className="border-none">
                            <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                <div className="flex items-start gap-3">
                                    <Info className="w-5 h-5 text-blue-600 mt-1" />
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {currentProvider.apiGuide.title}
                                    </h3>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pb-6">
                                <div className="space-y-4">
                                    <ol className="list-decimal list-inside space-y-2 text-gray-600">
                                        {currentProvider.apiGuide.steps.map((step, index) => (
                                            <li key={index} className="text-sm">
                                                {step}
                                            </li>
                                        ))}
                                    </ol>

                                    <div className="flex flex-col sm:flex-row gap-4 mt-6">
                                        {currentProvider.apiGuide.videoUrl && (
                                            <Link
                                                href={currentProvider.apiGuide.videoUrl}
                                                target="_blank"
                                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                <PlayCircle className="w-4 h-4" />
                                                Watch Video Tutorial
                                                <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        )}
                                        <Link
                                            href={currentProvider.apiGuide.docsUrl}
                                            target="_blank"
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                        >
                                            <span>Official Documentation</span>
                                            <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveConfig}
                        className="mt-8 w-full font-semibold  bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all duration-500"
                    >
                        Save Configuration
                    </button>
                </div>
            </main>
        </div>
    );
}
