'use client';
import React, { useState, useEffect } from "react";
import Header from "../dashboard/components/Header";
import Wrapper from "@/components/Wrapper";
import { Settings, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserConfig {
    LLM?: string;
    GOOGLE_API_KEY?: string;
}

const PROVIDER_CONFIG = {
    title: "Google Gemini API Key",
    description: "Required for using Google Gemini services",
    placeholder: "Enter your Google API key",
};

const SettingsPage = () => {
    const [config, setConfig] = useState<UserConfig>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadConfig = async () => {
            try {
                const response = await fetch(`http://localhost:8000/config/`);
                if (response.ok) {
                    const configData = await response.json();
                    setConfig(configData);
                } else {
                    throw new Error('Failed to load config');
                }
            } catch (error) {
                console.error("Error loading config:", error);
                toast({
                    title: 'Error',
                    description: 'Failed to load configuration',
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadConfig();
    }, []);

    const handleSaveConfig = async (apiKey: string) => {
        if (apiKey === '') {
            toast({
                title: 'Error',
                description: 'API key cannot be empty',
            });
            return;
        }

        try {
            const newConfig = {
                LLM: "google",
                GOOGLE_API_KEY: apiKey
            };

            const response = await fetch(`http://localhost:8000/config/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newConfig)
            });

            if (response.ok) {
                setConfig(newConfig);
                toast({
                    title: 'Success',
                    description: 'Configuration saved successfully',
                });
            } else {
                throw new Error('Failed to save config');
            }
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save configuration',
            });
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#E9E8F8]">
                <Header />
                <Wrapper className="lg:w-[60%]">
                    <div className="py-8">
                        <div className="text-center">Loading configuration...</div>
                    </div>
                </Wrapper>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#E9E8F8] font-instrument_sans">
            <Header />
            <Wrapper className="lg:w-[60%]">
                <div className="py-8 space-y-6">
                    {/* Settings Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Settings className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
                    </div>

                    {/* API Configuration Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Key className="w-5 h-5 text-blue-600" />
                            <h2 className="text-lg font-medium text-gray-900">API Configuration</h2>
                        </div>

                        {/* Provider Display */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                AI Provider
                            </label>
                            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
                                <div className="flex items-center justify-center gap-3">
                                    <span className="font-medium text-center text-blue-700">
                                        Google Gemini
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* API Key Input */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {PROVIDER_CONFIG.title}
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={config.GOOGLE_API_KEY || ''}
                                        onChange={(e) => setConfig(prev => ({
                                            ...prev,
                                            GOOGLE_API_KEY: e.target.value
                                        }))}
                                        className="flex-1 px-4 py-2.5 border border-gray-300 outline-none rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder={PROVIDER_CONFIG.placeholder}
                                    />
                                    <button
                                        onClick={() => handleSaveConfig(config.GOOGLE_API_KEY || '')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">{PROVIDER_CONFIG.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </div>
    );
};

export default SettingsPage;
