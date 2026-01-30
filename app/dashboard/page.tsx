"use client";

import DashboardOverview from "@/components/ui/dashboard/DashboardOverview";
import InitialForm from "@/components/ui/dashboard/initialform";
import { Spinner } from "@/components/ui/spinner";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [metadata, setMetadata] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch("/api/metadata/fetch");
      const data = await response.json();
      setMetadata(data.exists);
      setLoading(false);
    };
    fetchMetadata();
  }, []);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full">
      {!metadata ? (
        <div className="w-full flex items-center justify-center p-4 min-h-screen">
          <InitialForm />
        </div>
      ) : (
        <DashboardOverview />
      )}
    </div>
  );
}
