"use client";

import InitialForm from "@/components/ui/dashboard/initialform";
import Sidebar from "@/components/ui/dashboard/sidebar";
import { Spinner } from "@/components/ui/spinner";
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
      <div className="flex-1 flex w-full items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full">
      {!metadata ? (
        <div className="w-full flex items-center justify-center p-4 min-h-screen">
          <InitialForm />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
        </div>
      )}
    </div>
  );
}
