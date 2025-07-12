import { EmptySessionsCard } from "./EmptySessionsCard";

export default function EmptySessionsCardDemo() {
  const handleStartSession = () => {
    console.log("Starting new session...");
  };

  return (
    <div className="w-[300px] h-[400px] p-4 bg-background border border-border rounded-xl">
      <EmptySessionsCard onStartSession={handleStartSession} />
    </div>
  );
} 