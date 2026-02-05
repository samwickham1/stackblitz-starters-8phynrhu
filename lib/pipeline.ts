"use client";

import { useEffect, useState } from "react";
import { PipelineItem, PipelineStage } from "@/lib/types";
import { pipelineSeed } from "@/lib/data";

const STORAGE_KEY = "signal_scout_pipeline_v1";

function loadPipeline(): PipelineItem[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return pipelineSeed;
  try {
    return JSON.parse(raw) as PipelineItem[];
  } catch {
    return pipelineSeed;
  }
}

function savePipeline(items: PipelineItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function usePipeline() {
  const [items, setItems] = useState<PipelineItem[]>([]);

  useEffect(() => {
    setItems(loadPipeline());
  }, []);

  useEffect(() => {
    if (items.length > 0) savePipeline(items);
  }, [items]);

  const upsert = (companyId: string, stage: PipelineStage = "Target") => {
    setItems((prev) => {
      const existing = prev.find((p) => p.companyId === companyId);
      if (existing) {
        return prev.map((p) =>
          p.companyId === companyId
            ? { ...p, stage, updatedAt: new Date().toISOString() }
            : p
        );
      }
      return [
        ...prev,
        {
          companyId,
          stage,
          notes: "",
          updatedAt: new Date().toISOString()
        }
      ];
    });
  };

  const setStage = (companyId: string, stage: PipelineStage) => {
    setItems((prev) =>
      prev.map((p) =>
        p.companyId === companyId
          ? { ...p, stage, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const setNotes = (companyId: string, notes: string) => {
    setItems((prev) =>
      prev.map((p) =>
        p.companyId === companyId
          ? { ...p, notes, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const remove = (companyId: string) => {
    setItems((prev) => prev.filter((p) => p.companyId !== companyId));
  };

  const addToPipeline = (companyId: string) => upsert(companyId, "Target");

  const getItem = (companyId: string) =>
    items.find((p) => p.companyId === companyId);

  return {
    items,
    addToPipeline,
    setStage,
    setNotes,
    remove,
    getItem
  };
}
