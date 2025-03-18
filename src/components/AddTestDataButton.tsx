import { Button } from "./ui/button";
import { addProject } from "@/lib/data";
import { toast } from "sonner";

export function AddTestDataButton() {
  const generateTestData = async () => {
    const statuses = ['idea', 'in-progress', 'mixing', 'mastering', 'completed'];
    const genres = ['Hip Hop', 'Trap', 'R&B', 'Drill', 'Pop'];
    const projectNames = [
      'Summer Vibes', 'Night Rider', 'Cloud Nine', 
      'Street Dreams', 'Ocean Waves', 'City Lights',
      'Midnight Hour', 'Purple Rain', 'Golden Days',
      'Future Beats'
    ];

    try {
      for (let i = 0; i < 10; i++) {
        const project = {
          id: crypto.randomUUID(),
          name: projectNames[i],
          description: `Test project ${i + 1} description`,
          status: statuses[i % statuses.length],
          genres: [genres[i % genres.length]],
          bpm: Math.floor(Math.random() * 40) + 120, // 120-160 BPM
          key: ['C', 'G', 'D', 'A', 'E'][Math.floor(Math.random() * 5)],
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
          completionPercentage: Math.floor(Math.random() * 100)
        };

        await addProject(project);
      }
      toast.success("Added 10 test projects!");
    } catch (error) {
      toast.error("Failed to add test data");
      console.error(error);
    }
  };

  return (
    <Button 
      onClick={generateTestData}
      variant="outline"
      size="sm"
    >
      Add Test Data
    </Button>
  );
} 