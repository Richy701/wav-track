import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import UserMenu from '@/components/UserMenu';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import CreateProjectDialog from '@/components/project/CreateProjectDialog';
import { Plus } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { getProjects } from '@/lib/data';

interface HeaderActionsProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function HeaderActions({ 
  orientation = 'horizontal',
  className 
}: HeaderActionsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { projects, refreshProjects } = useProjects();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  
  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleProjectCreated = () => {
    // Refresh the projects list
    refreshProjects();
  };

  const isMainPage = location.pathname === '/';

  const items = [
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/profile/settings' }
  ];

  return (
    <nav className={cn(
      'flex',
      orientation === 'vertical' ? 'flex-col space-y-2' : 'items-center space-x-4',
      className
    )}>
      {items.map((item) => (
        <Button
          key={item.href}
          variant="ghost"
          asChild
          className={cn(
            orientation === 'vertical' && 'w-full justify-start'
          )}
        >
          <Link to={item.href}>{item.label}</Link>
        </Button>
      ))}

      <div className={orientation === 'vertical' ? "self-start" : ""}>
        <ThemeSwitcher />
      </div>

      {user ? (
        <>
          {isMainPage && (
            <Button 
              variant="default"
              className={cn(
                "rounded-xl px-6 py-2",
                orientation === 'vertical' ? "w-full" : ""
              )}
              onClick={() => setIsCreateProjectOpen(true)}
            >
              <Plus weight="bold" className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </>
      ) : (
        <>
          <Button 
            variant="ghost" 
            className={orientation === 'vertical' ? "w-full justify-start" : ""}
            onClick={() => handleNavigate('/login')}
          >
            Login
          </Button>
          <Button 
            variant="default" 
            className={orientation === 'vertical' ? "w-full" : ""}
            onClick={() => handleNavigate('/register')}
          >
            Register
          </Button>
        </>
      )}

      <CreateProjectDialog 
        isOpen={isCreateProjectOpen}
        onOpenChange={setIsCreateProjectOpen}
        projectsCount={projects.length}
        onProjectCreated={handleProjectCreated}
      />
    </nav>
  );
}
