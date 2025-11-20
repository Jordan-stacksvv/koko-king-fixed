import { useState, useEffect, useCallback } from "react";

export interface Branch {
  id: string;
  name: string;
  location: string;
  phone: string;
  manager: string;
  image?: string;
  createdAt: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const useBranchData = () => {
  const [branches, setBranches] = useState<Branch[]>([]);

  // Load branches from localStorage
  const loadBranches = useCallback(() => {
    const saved = localStorage.getItem("branches");
    if (saved) {
      setBranches(JSON.parse(saved));
    }
    return saved ? JSON.parse(saved) : [];
  }, []);

  // Save branches to localStorage and sync
  const saveBranches = useCallback((updatedBranches: Branch[]) => {
    localStorage.setItem("branches", JSON.stringify(updatedBranches));
    setBranches(updatedBranches);
    
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new Event("storage"));
  }, []);

  // Add new branch
  const addBranch = useCallback((branchData: Omit<Branch, "id" | "createdAt">) => {
    const newBranch: Branch = {
      ...branchData,
      id: `branch-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [...branches, newBranch];
    saveBranches(updated);
    return newBranch;
  }, [branches, saveBranches]);

  // Update existing branch
  const updateBranch = useCallback((branchId: string, updates: Partial<Branch>) => {
    const updated = branches.map(b => 
      b.id === branchId ? { ...b, ...updates } : b
    );
    saveBranches(updated);
  }, [branches, saveBranches]);

  // Delete branch
  const deleteBranch = useCallback((branchId: string) => {
    const updated = branches.filter(b => b.id !== branchId);
    saveBranches(updated);
  }, [branches, saveBranches]);

  // Get single branch by ID
  const getBranchById = useCallback((branchId: string) => {
    return branches.find(b => b.id === branchId);
  }, [branches]);

  // Get manager's branch (from localStorage)
  const getManagerBranch = useCallback(() => {
    const managerData = localStorage.getItem("managerAuth");
    if (!managerData) return null;
    
    try {
      const parsed = JSON.parse(managerData);
      const branchId = parsed.branchId || parsed;
      return branches.find(b => b.id === branchId);
    } catch {
      return null;
    }
  }, [branches]);

  // Listen for storage changes (cross-tab sync)
  useEffect(() => {
    loadBranches();
    
    const handleStorageChange = () => {
      loadBranches();
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadBranches]);

  return {
    branches,
    loadBranches,
    saveBranches,
    addBranch,
    updateBranch,
    deleteBranch,
    getBranchById,
    getManagerBranch
  };
};
