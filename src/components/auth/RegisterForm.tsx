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
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* Required Fields Section */}
      <div className="grid gap-4 sm:gap-6">
        <div className="grid sm:grid-cols-2 gap-4">
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
                "h-10 sm:h-11 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
                isDark 
                  ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                  : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
              )}
            />
          </FormField>

          <FormField label="Artist Name" icon={Icons.microphone}>
            <Input
              id="artist_name"
              name="artist_name"
              placeholder="Your stage name"
              value={formData.artist_name}
              onChange={handleChange}
              autoComplete="nickname"
              className={cn(
                "h-10 sm:h-11 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
                isDark 
                  ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                  : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
              )}
            />
          </FormField>
        </div>

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
              "h-10 sm:h-11 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
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
              "h-10 sm:h-11 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark 
                ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" 
                : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}
          />
        </FormField>
      </div>

      {/* Artist Profile Section */}
      <div className="relative pt-6 sm:pt-8">
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

      <div className="grid gap-6">
        <FormField label="Genres" icon={Icons.genres}>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'hip_hop', label: 'Hip-Hop/Rap', icon: Icons.microphone },
                { id: 'rnb', label: 'R&B/Soul', icon: Icons.music },
                { id: 'pop', label: 'Pop', icon: Icons.music },
                { id: 'electronic', label: 'Electronic', icon: Icons.waveform },
                { id: 'trap', label: 'Trap', icon: Icons.microphone },
                { id: 'house', label: 'House', icon: Icons.music },
                { id: 'techno', label: 'Techno', icon: Icons.waveform },
                { id: 'dubstep', label: 'Dubstep', icon: Icons.waveform },
                { id: 'ambient', label: 'Ambient', icon: Icons.waveform },
                { id: 'jazz', label: 'Jazz', icon: Icons.music },
                { id: 'rock', label: 'Rock', icon: Icons.music },
                { id: 'metal', label: 'Metal', icon: Icons.music },
                { id: 'indie', label: 'Indie', icon: Icons.music },
                { id: 'lofi', label: 'Lo-Fi', icon: Icons.music },
                { id: 'world', label: 'World', icon: Icons.website },
                { id: 'experimental', label: 'Experimental', icon: Icons.star }
              ].map(genre => {
                const isSelected = formData.genres.includes(genre.id);
                return (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        removeGenre(genre.id);
                      } else {
                        handleGenreChange(genre.id);
                      }
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm",
                      "transition-all duration-200",
                      "border",
                      isSelected
                        ? "bg-primary text-white border-primary/20 shadow-sm"
                        : isDark
                          ? "bg-zinc-800/50 border-zinc-700 text-zinc-300 hover:border-primary/50"
                          : "bg-white border-zinc-200 text-zinc-700 hover:border-primary/50"
                    )}
                  >
                    <genre.icon className={cn(
                      "w-3.5 h-3.5",
                      isSelected ? "text-white" : isDark ? "text-zinc-400" : "text-zinc-500"
                    )} />
                    {genre.label}
                  </button>
                );
              })}
            </div>
            {formData.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {formData.genres.map(genreId => {
                  const genre = [
                    { id: 'hip_hop', label: 'Hip-Hop/Rap' },
                    { id: 'rnb', label: 'R&B/Soul' },
                    { id: 'pop', label: 'Pop' },
                    { id: 'electronic', label: 'Electronic' },
                    { id: 'trap', label: 'Trap' },
                    { id: 'house', label: 'House' },
                    { id: 'techno', label: 'Techno' },
                    { id: 'dubstep', label: 'Dubstep' },
                    { id: 'ambient', label: 'Ambient' },
                    { id: 'jazz', label: 'Jazz' },
                    { id: 'rock', label: 'Rock' },
                    { id: 'metal', label: 'Metal' },
                    { id: 'indie', label: 'Indie' },
                    { id: 'lofi', label: 'Lo-Fi' },
                    { id: 'world', label: 'World' },
                    { id: 'experimental', label: 'Experimental' }
                  ].find(g => g.id === genreId);
                  
                  if (!genre) return null;
                  
                  return (
                    <Badge
                      key={genre.id}
                      variant="secondary"
                      className={cn(
                        "gap-1.5 pl-3 pr-2 py-1",
                        isDark ? "bg-zinc-800" : "bg-zinc-100"
                      )}
                    >
                      {genre.label}
                      <button
                        type="button"
                        onClick={() => removeGenre(genre.id)}
                        aria-label={`Remove ${genre.label} genre`}
                        className={cn(
                          "ml-1 rounded-full p-0.5",
                          "hover:bg-zinc-700/50 dark:hover:bg-zinc-600/50",
                          "transition-colors"
                        )}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </FormField>

        <FormField label="Preferred DAW" icon={Icons.daw}>
          <Select name="daw" value={formData.daw} onValueChange={handleDAWChange}>
            <SelectTrigger className={cn(
              "h-10 sm:h-11 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
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
              "min-h-[120px] transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
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
              "h-10 sm:h-11 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
              isDark ? "bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-400" : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-500"
            )}
          />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
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
                "h-10 sm:h-11 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
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
                "h-10 sm:h-11 px-3 transition-colors focus:ring-2 focus:ring-primary/20 text-sm",
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
          "w-full h-11 transition-colors text-sm font-medium text-white",
          isDark
            ? "bg-black hover:bg-black/90"
            : "bg-primary hover:bg-primary/90"
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create Account</span>
        )}
      </Button>
    </form>
  );
}
