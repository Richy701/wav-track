// Optimized icon exports - only include icons actually used in the app
// This reduces bundle size by avoiding importing entire icon libraries

// Lucide React Icons (most commonly used)
export {
  Play,
  Pause,
  RotateCcw,
  Settings,
  Music,
  Radio,
  Quote,
  RefreshCw,
  Brain,
  Clock,
  Target,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  BarChart,
  Coffee,
  Menu,
  Plus,
  Moon,
  Check,
  Edit,
  Trash,
  X,
  SkipForward,
  MoreVertical,
  Flame,
  Trophy,
  Timer,
  Calendar,
  Lightbulb,
  Bell,
  Sparkles,
  Mic,
  Drum,
  Wand,
  Music2,
  Waves,
  LogOut,
  User as UserIcon,
  CalendarCheck,
  Download,
  Star,
  Medal,
  LineChart,
  BarChart as BarChartIcon,
} from 'lucide-react'

// Phosphor Icons (only essential ones)
export {
  ChartLineUp,
  PencilSimple,
  CheckCircle,
  MusicNote,
  // Add other Phosphor icons as needed
} from '@phosphor-icons/react'

// For any icons not in the above libraries, we can create simple SVG components
export const CustomIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Custom icon paths go here */}
  </svg>
)

// Re-export common icon props type for TypeScript support
export type IconProps = {
  className?: string
  size?: number
  strokeWidth?: number
}