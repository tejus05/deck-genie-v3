"use client";

import React, { useState, useEffect } from "react";

import Wrapper from "@/components/Wrapper";

import { DashboardApi } from "../api/dashboard";
import { PresentationGrid } from "./PresentationGrid";
import { DashboardStats } from "./DashboardStats";
import { PresentationFilters } from "./PresentationFilters";
import { Presentation } from "../types";

import Header from "./Header";

const DashboardPage: React.FC = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [filteredPresentations, setFilteredPresentations] = useState<Presentation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      await fetchPresentations();
    };
    loadData();
  }, []);

  const fetchPresentations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await DashboardApi.getPresentations();
      setPresentations(data);
      setFilteredPresentations(data); // Initialize filtered presentations
    } catch (err) {
      setError(null);
      setPresentations([]);
      setFilteredPresentations([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E9E8F8]">
      <Header />
      <Wrapper>
        <main className="container mx-auto px-4 py-8">
          <DashboardStats presentations={presentations} />
          
          <PresentationFilters 
            presentations={presentations}
            onFilteredPresentations={setFilteredPresentations}
          />
          
          <section>
            <h2 className="text-2xl font-roboto font-medium mb-6">
              Slide Presentations ({filteredPresentations.length})
            </h2>
            <PresentationGrid
              presentations={filteredPresentations}
              type="slide"
              isLoading={isLoading}
              error={error}
            />
          </section>
        </main>
      </Wrapper>
    </div>
  );
};

export default DashboardPage;
