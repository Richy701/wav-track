import { useState, memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/ThemeContext';
import { X } from 'lucide-react';
import { FLStudioIcon, AbletonIcon, LogicProIcon, ProToolsIcon, StudioOneIcon, BitwigIcon, ReaperIcon } from '@/components/DawIcons';

interface RegisterFormProps {
  onSuccess?: () => void;
}

// Memoize the FormField component
const FormField = memo(({ 
  label, 
  icon: Icon, 
  children, 
  className 
}: { 
  label: string; 
  icon?: React.ComponentType<{ className?: string }>; 
  children: React.ReactNode;
  className?: string;
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn("space-y-1.5 sm:space-y-2", className)}>
      <Label 
        className={cn(
          "flex items-center gap-2 text-sm font-medium",
          isDark ? "text-zinc-400" : "text-zinc-600"
        )}
      >
        {Icon && <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", isDark ? "text-zinc-400" : "text-zinc-600")} />}
        {label}
      </Label>
      {children}
    </div>
  );
});

FormField.displayName = 'FormField';

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    artist_name: '',
    genres: [] as string[],
    daw: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenreChange = (value: string) => {
    if (!formData.genres.includes(value)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, value]
      }));
    }
  };

  const removeGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(g => g !== genre)
    }));
  };

  const handleDAWChange = (value: string) => {
    setFormData(prev => ({ ...prev, daw: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(formData);
      if (success && onSuccess) {
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const dawOptions = [
    { value: 'ableton', label: 'Ableton Live', icon: <AbletonIcon className="h-4 w-4" /> },
    { value: 'fl_studio', label: 'FL Studio', icon: <FLStudioIcon className="h-4 w-4" /> },
    { value: 'logic_pro', label: 'Logic Pro', icon: <LogicProIcon className="h-4 w-4" /> },
    { value: 'pro_tools', label: 'Pro Tools', icon: <ProToolsIcon className="h-4 w-4" /> },
    { value: 'studio_one', label: 'Studio One', icon: <StudioOneIcon className="h-4 w-4" /> },
    { value: 'reaper', label: 'Reaper', icon: <ReaperIcon className="h-4 w-4" /> },
    { value: 'bitwig', label: 'Bitwig', icon: <BitwigIcon className="h-4 w-4" /> },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      {/* Required Fields Section */}
      <div className="space-y-3 sm:space-y-4">
        <FormField label="Full Name" icon={Icons.user}>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            required
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            className={cn(
              "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark 
                ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}
          />
        </FormField>

        <FormField label="Email" icon={Icons.mail}>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className={cn(
              "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark 
                ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}
          />
        </FormField>

        <FormField label="Password" icon={Icons.lock}>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            className={cn(
              "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark 
                ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}
          />
        </FormField>
      </div>

      {/* Artist Profile Section */}
      <div className="relative pt-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className={cn(
            "w-full border-t",
            isDark ? "border-zinc-700" : "border-zinc-200"
          )} />
        </div>
        <div className="relative flex justify-center text-sm font-semibold uppercase">
          <span className={cn(
            "px-2",
            isDark 
              ? "bg-zinc-900 text-zinc-400" 
              : "bg-white text-zinc-600"
          )}>
            Artist Profile
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <FormField label="Artist Name" icon={Icons.microphone}>
          <Input
            id="artist_name"
            name="artist_name"
            placeholder="Your stage name"
            value={formData.artist_name}
            onChange={handleChange}
            autoComplete="nickname"
            className={cn(
              "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark 
                ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}
          />
        </FormField>

        <FormField label="Genres" icon={Icons.genres}>
          <Select name="genres" onValueChange={handleGenreChange}>
            <SelectTrigger className={cn(
              "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}>
              <SelectValue placeholder="Select your genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hip_hop">Hip-Hop/Rap</SelectItem>
              <SelectItem value="rnb">R&B/Soul</SelectItem>
              <SelectItem value="pop">Pop</SelectItem>
              <SelectItem value="electronic">Electronic/Dance</SelectItem>
              <SelectItem value="trap">Trap</SelectItem>
              <SelectItem value="house">House</SelectItem>
              <SelectItem value="techno">Techno</SelectItem>
              <SelectItem value="dubstep">Dubstep</SelectItem>
              <SelectItem value="ambient">Ambient</SelectItem>
              <SelectItem value="jazz">Jazz</SelectItem>
              <SelectItem value="rock">Rock</SelectItem>
              <SelectItem value="metal">Metal</SelectItem>
              <SelectItem value="indie">Indie</SelectItem>
              <SelectItem value="lofi">Lo-Fi</SelectItem>
              <SelectItem value="world">World Music</SelectItem>
              <SelectItem value="experimental">Experimental</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {formData.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.genres.map((genre) => (
                <Badge
                  key={genre}
                  variant="secondary"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {genre.replace(/_/g, ' ')}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={() => removeGenre(genre)}
                    aria-label={`Remove ${genre} genre`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </FormField>

        <FormField label="Preferred DAW" icon={Icons.daw}>
          <Select name="daw" value={formData.daw} onValueChange={handleDAWChange}>
            <SelectTrigger className={cn(
              "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}>
              <SelectValue placeholder="Select your DAW" />
            </SelectTrigger>
            <SelectContent>
              {dawOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="flex items-center"
                >
                  <div className="flex items-center">
                    <div className="w-6 h-6 mr-2 flex items-center justify-center">
                      {option.icon}
                    </div>
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Bio" icon={Icons.info}>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us about yourself and your music..."
            value={formData.bio}
            onChange={handleChange}
            className={cn(
              "h-20 sm:h-24 min-h-[100px] transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}
          />
        </FormField>

        <FormField label="Location" icon={Icons.location}>
          <Input
            id="location"
            name="location"
            placeholder="City, Country"
            value={formData.location}
            onChange={handleChange}
            autoComplete="address-level2"
            className={cn(
              "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}
          />
        </FormField>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          <FormField label="Phone (optional)" icon={Icons.phone}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              className={cn(
                "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
                isDark 
                  ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                  : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
              )}
            />
          </FormField>

          <FormField label="Website (optional)" icon={Icons.website}>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://your-website.com"
              value={formData.website}
              onChange={handleChange}
              autoComplete="url"
              className={cn(
                "h-9 sm:h-10 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
                isDark 
                  ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                  : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
              )}
            />
          </FormField>
        </div>
      </div>

      <Button 
        type="submit" 
        className={cn(
          "w-full h-9 sm:h-10 transition-colors text-sm font-medium text-white",
          isDark
            ? "bg-black hover:bg-black/90"
            : "bg-primary hover:bg-primary/90"
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-3.5 w-3.5 animate-spin" />
            <span className="text-sm">Creating account...</span>
          </>
        ) : (
          <span className="text-sm">Create Account</span>
        )}
      </Button>
    </form>
  );
}
