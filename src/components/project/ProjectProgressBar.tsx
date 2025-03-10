interface ProjectProgressBarProps {
  completionPercentage: number;
}

export default function ProjectProgressBar({ completionPercentage }: ProjectProgressBarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between text-xs mb-1 font-mono">
        <span>Progress</span>
        <span>{completionPercentage}%</span>
      </div>
      <div className="w-full bg-secondary rounded-full h-1.5">
        <div
          className="h-2 bg-primary rounded-full progress-bar"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
    </div>
  );
}
