import React from 'react';
import { BaseLayout, Container, ResponsiveGrid, Stack } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  MusicNote, 
  ChartLineUp, 
  Clock, 
  Trophy,
  Lightning,
  Users,
  Headphones,
  Microphone
} from '@phosphor-icons/react';

const Dashboard = () => {
  const stats = [
    {
      title: "Total Beats",
      value: "24",
      icon: <MusicNote className="h-4 w-4" />,
      description: "Beats created this month"
    },
    {
      title: "Productivity",
      value: "85%",
      icon: <ChartLineUp className="h-4 w-4" />,
      description: "Completion rate"
    },
    {
      title: "Time Spent",
      value: "32h",
      icon: <Clock className="h-4 w-4" />,
      description: "Production time this month"
    },
    {
      title: "Achievements",
      value: "12",
      icon: <Trophy className="h-4 w-4" />,
      description: "Milestones reached"
    }
  ];

  const features = [
    {
      title: "Quick Actions",
      description: "Start a new beat or continue where you left off",
      icon: <Lightning className="h-5 w-5" />
    },
    {
      title: "Collaboration",
      description: "Connect and work with other producers",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Sound Library",
      description: "Access your samples and presets",
      icon: <Headphones className="h-5 w-5" />
    },
    {
      title: "Recording",
      description: "Record and manage your audio",
      icon: <Microphone className="h-5 w-5" />
    }
  ];

  return (
    <BaseLayout>
      <Container>
        <Stack spacing="xl">
          {/* Stats Grid */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <ResponsiveGrid 
              cols={{ 
                default: 1, 
                sm: 2, 
                lg: 4 
              }}
              gap="medium"
            >
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <div className="h-4 w-4 text-muted-foreground">
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </section>

          {/* Features Grid */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
            <ResponsiveGrid 
              cols={{ 
                default: 1, 
                sm: 2 
              }}
              gap="medium"
            >
              {features.map((feature, index) => (
                <Card key={index} className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </ResponsiveGrid>
          </section>

          {/* Recent Activity */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest production activity</CardDescription>
              </CardHeader>
              <CardContent>
                <Stack spacing="sm" dividers>
                  <div className="py-2">Activity 1</div>
                  <div className="py-2">Activity 2</div>
                  <div className="py-2">Activity 3</div>
                </Stack>
              </CardContent>
            </Card>
          </section>
        </Stack>
      </Container>
    </BaseLayout>
  );
};

export default Dashboard; 