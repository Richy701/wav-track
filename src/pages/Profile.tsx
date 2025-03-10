import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Gear, 
  ArrowLeft as PhArrowLeft, 
  MapPin as PhMapPin, 
  At, 
  ShareNetwork, 
  ChatCircleText, 
  Users as PhUsers, 
  MusicNote, 
  Microphone, 
  Info as PhInfo,
  WaveSquare, 
  CheckCircle as PhCheckCircle, 
  Trophy as PhTrophy, 
  ChartLineUp, 
  Camera as PhCamera, 
  SignOut,
  InstagramLogo,
  TwitterLogo,
  YoutubeLogo,
  Envelope,
  User,
  Phone as PhPhone,
  Clock,
  Fire,
  Star,
  Headphones,
  Guitar,
  SoundcloudLogo
} from '@phosphor-icons/react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Stats from '@/components/Stats';
import ProjectList from '@/components/ProjectList';
import Timer from '@/components/Timer';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  getBeatsCreatedInRange, 
  getProjectsByStatus,
  beatActivities,
  projects
} from '@/lib/data';
import { toast } from 'sonner';

const Profile = () => {
  const { profile, logout, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refresh profile when component mounts or when returning from settings
  useEffect(() => {
    const loadProfile = async () => {
      console.log('Profile: Starting data refresh...');
      setIsLoading(true);
      try {
        // Force a fresh fetch from the server
        await refreshProfile();
        console.log('Profile: Data refresh successful');
        console.log('Current profile data:', {
          name: profile?.name,
          artist_name: profile?.artist_name,
          bio: profile?.bio,
          daw: profile?.daw
        });
      } catch (error) {
        console.error('Error refreshing profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    // Load fresh data when mounting or navigating back from settings
    loadProfile();
  }, [refreshProfile, location.key]); // Remove profile from dependencies

  // Calculate the initials for the avatar fallback
  const getInitials = () => {
    if (!profile?.name) return 'U';
    return profile.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Memoize stats calculations
  const stats = useMemo(() => ({
    productivityScore: profile?.productivityScore || 0,
    totalBeats: profile?.totalBeats || 0,
    completedProjects: profile?.completedProjects || 0,
    completionRate: profile?.completionRate || 0
  }), [profile]);

  // Memoize overview stats
  const overviewStats = useMemo(() => ({
    followers: profile?.followers || 0,
    following: profile?.following || 0,
    collaborations: profile?.collaborations || 0
  }), [profile]);

  // Memoize stats cards
  const statsCards = useMemo(() => [
    {
      value: stats.totalBeats,
      label: "Total Beats",
      icon: <WaveSquare weight="fill" className="h-5 w-5 text-primary" />,
      gradient: "from-primary/10 via-primary/5 to-transparent"
    },
    {
      value: stats.completedProjects,
      label: "Completed",
      icon: <PhCheckCircle weight="fill" className="h-5 w-5 text-green-500" />,
      gradient: "from-green-500/10 via-green-500/5 to-transparent"
    },
    {
      value: stats.productivityScore,
      label: "Score",
      icon: <PhTrophy weight="fill" className="h-5 w-5 text-yellow-500" />,
      gradient: "from-yellow-500/10 via-yellow-500/5 to-transparent"
    },
    {
      value: stats.completionRate,
      label: "Success Rate",
      icon: <ChartLineUp weight="fill" className="h-5 w-5 text-blue-500" />,
      gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
      suffix: "%"
    }
  ], [stats]);

  // Memoize handlers
  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      console.log('File selected:', file);
      await refreshProfile();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  }, [refreshProfile]);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  }, [logout, navigate]);

  // Memoize social links
  const socialLinks = useMemo(() => [
    {
      name: 'Instagram',
      icon: <InstagramLogo weight="fill" className="h-4 w-4" />,
      href: profile?.social?.instagram || '#',
      username: profile?.social?.instagram_username || 'Add Instagram'
    },
    {
      name: 'Twitter',
      icon: <TwitterLogo weight="fill" className="h-4 w-4" />,
      href: profile?.social?.twitter || '#',
      username: profile?.social?.twitter_username || 'Add Twitter'
    },
    {
      name: 'YouTube',
      icon: <YoutubeLogo weight="fill" className="h-4 w-4" />,
      href: profile?.social?.youtube || '#',
      username: profile?.social?.youtube_username || 'Add YouTube'
    },
    {
      name: 'Email',
      icon: <Envelope weight="fill" className="h-4 w-4" />,
      href: `mailto:${profile?.email || ''}`,
      username: profile?.email || 'Add Email'
    }
  ], [profile]);

  // Update contact info icons:
  const contactInfo = [
    {
      icon: <User weight="fill" className="h-4 w-4" />,
      label: 'Name',
      value: profile?.name || 'Add your name'
    },
    {
      icon: <PhPhone weight="fill" className="h-4 w-4" />,
      label: 'Phone',
      value: profile?.phone || 'Add phone number'
    },
    {
      icon: <Envelope weight="fill" className="h-4 w-4" />,
      label: 'Email',
      value: profile?.email || 'Add email'
    },
    {
      icon: <PhMapPin weight="fill" className="h-4 w-4" />,
      label: 'Location',
      value: profile?.location || 'Add location'
    }
  ];

  // Add new sections after the statsCards array:

  const achievementsList = [
    {
      icon: <PhTrophy weight="fill" className="h-5 w-5 text-yellow-500" />,
      title: "Beat Making Master",
      description: "Created 100+ beats",
      progress: 75,
      current: 75,
      target: 100
    },
    {
      icon: <Fire weight="fill" className="h-5 w-5 text-orange-500" />,
      title: "Productivity Streak",
      description: "7 days in a row",
      progress: 100,
      current: 7,
      target: 7
    },
    {
      icon: <Star weight="fill" className="h-5 w-5 text-purple-500" />,
      title: "Genre Explorer",
      description: "Created beats in 5 different genres",
      progress: 60,
      current: 3,
      target: 5
    }
  ];

  const genres = [
    { name: "Hip Hop", level: 85 },
    { name: "Trap", level: 75 },
    { name: "R&B", level: 65 },
    { name: "Pop", level: 60 },
    { name: "Electronic", level: 45 }
  ];

  // Add new sections for the About Me card
  const producerInfo = {
    equipment: [
      { name: "DAW", value: profile?.daw || "Add your DAW" },
      { name: "Audio Interface", value: "Universal Audio Apollo" },
      { name: "Monitors", value: "KRK Rokit 5" }
    ],
    specialties: [
      { icon: <MusicNote className="h-4 w-4" />, label: "Beat Making" },
      { icon: <Microphone className="h-4 w-4" />, label: "Vocal Production" },
      { icon: <WaveSquare className="h-4 w-4" />, label: "Sound Design" }
    ],
    recentActivity: [
      { 
        icon: <MusicNote className="h-4 w-4 text-primary" />,
        text: "Created a new beat",
        time: "2 hours ago"
      },
      { 
        icon: <PhCheckCircle className="h-4 w-4 text-green-500" />,
        text: "Completed project 'Summer Vibes'",
        time: "1 day ago"
      },
      { 
        icon: <PhTrophy className="h-4 w-4 text-yellow-500" />,
        text: "Reached 50 beats milestone",
        time: "3 days ago"
      }
    ]
  };

  // Get recent activities
  const getRecentActivities = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get recent beats created
    const recentBeats = getBeatsCreatedInRange(thirtyDaysAgo, now)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    // Get recently completed projects
    const completedProjects = getProjectsByStatus('completed')
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 3);

    // Combine and sort activities
    const activities = [
      ...recentBeats.map(beat => ({
        type: 'beat',
        icon: <MusicNote className="h-4 w-4 text-primary" />,
        text: `Created ${beat.count} beat${beat.count > 1 ? 's' : ''}`,
        date: new Date(beat.date),
        projectId: beat.projectId
      })),
      ...completedProjects.map(project => ({
        type: 'completion',
        icon: <PhCheckCircle className="h-4 w-4 text-green-500" />,
        text: `Completed project "${project.title}"`,
        date: new Date(project.lastModified),
        projectId: project.id
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

    return activities;
  };

  const recentActivities = getRecentActivities();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="min-h-screen bg-background/50">
        {/* Back Navigation */}
        <div className="fixed top-6 left-4 z-[100]">
          <Button 
            variant="ghost" 
            size="icon"
            className="group relative overflow-hidden bg-black/80 hover:bg-black/60 text-white rounded-full w-8 h-8 p-0 transition-all duration-300 ease-out hover:scale-110 hover:shadow-lg hover:shadow-black/25"
            onClick={() => navigate('/')}
          >
            <PhArrowLeft className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-[-2px]" />
            <span className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>

        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image - Using a gradient as placeholder */}
          <div className="h-48 bg-gradient-to-r from-primary/20 via-primary/10 to-background" />
          
          {/* Profile Info Section */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 relative z-10">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Avatar with Upload Button */}
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  aria-label="Upload profile picture"
                  title="Upload profile picture"
                >
                  <PhCamera className="h-6 w-6 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  aria-label="Profile picture upload"
                  title="Choose a profile picture"
                />
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{profile?.name || 'Producer Name'}</h1>
                    <p className="text-lg text-primary font-medium">
                      {profile?.artist_name || 'Add Artist Name'}
                    </p>
                    <p className="text-muted-foreground mt-1">{profile?.bio ? `${profile.bio.substring(0, 50)}...` : 'Music Producer & Beat Maker'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="gap-1">
                        <PhMapPin className="h-3 w-3" />
                        {profile?.location || 'Location'}
                      </Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Member since {new Date().getFullYear()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/profile/settings')}>
                      <Gear className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="destructive" onClick={handleLogout}>
                      <SignOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="stats">Stats</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-6">
                    {/* Bio Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">About Me</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <p className="text-muted-foreground">
                            {profile?.bio || 'Add a bio to tell others about yourself and your music production journey.'}
                          </p>
                        </div>

                        {/* Equipment Section */}
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Gear className="h-4 w-4 text-muted-foreground" />
                            Equipment & Tools
                          </h4>
                          <div className="grid gap-2">
                            {producerInfo.equipment.map((item, index) => (
                              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                <span className="text-sm font-medium">{item.name}</span>
                                <span className="text-sm text-muted-foreground">{item.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Specialties Section */}
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Star className="h-4 w-4 text-muted-foreground" />
                            Specialties
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {producerInfo.specialties.map((specialty, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {specialty.icon}
                                {specialty.label}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Recent Activity Section */}
                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            Recent Activity
                          </h4>
                          <div className="space-y-3">
                            {recentActivities.length > 0 ? (
                              recentActivities.map((activity, index) => (
                                <div key={index} className="flex items-start gap-3 group">
                                  <div className="mt-0.5">{activity.icon}</div>
                                  <div className="flex-1">
                                    <p className="text-sm group-hover:text-primary transition-colors">
                                      {activity.text}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDistanceToNow(activity.date, { addSuffix: true })}
                                    </p>
                                  </div>
                                  {activity.projectId && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => navigate(`/project/${activity.projectId}`)}
                                    >
                                      View
                                    </Button>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-6 text-muted-foreground">
                                <p className="text-sm">No recent activity</p>
                                <p className="text-xs mt-1">Start creating beats to see your activity here!</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {statsCards.map((stat, index) => (
                        <Card key={index}>
                          <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`rounded-full p-3 bg-gradient-to-br ${stat.gradient}`}>
                                {stat.icon}
                              </div>
                              <div>
                                <div className="text-2xl font-bold">
                                  {stat.value}{stat.suffix || ''}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {stat.label}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Social Links */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Connect & Share</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {socialLinks.map((link, index) => (
                            <a
                              key={index}
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="rounded-full p-2 bg-muted">
                                {link.icon}
                              </div>
                              <div>
                                <div className="font-medium">{link.name}</div>
                                <div className="text-sm text-muted-foreground">{link.username}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="stats">
                    <Stats 
                      projects={profile?.projects || []} 
                      sessions={[]} // We'll need to add sessions to the profile context
                    />
                  </TabsContent>

                  <TabsContent value="projects">
                    <ProjectList projects={profile?.projects || []} title="My Projects" />
                  </TabsContent>

                  <TabsContent value="achievements" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievementsList.map((achievement, index) => (
                        <Card key={index}>
                          <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-4">
                              <div className="rounded-full p-3 bg-muted">
                                {achievement.icon}
                              </div>
                              <div>
                                <div className="font-medium">{achievement.title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {achievement.description}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{achievement.current}/{achievement.target}</span>
                              </div>
                              <Progress value={achievement.progress} />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
