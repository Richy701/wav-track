import { SignInPage, Testimonial } from "@/components/ui/sign-in";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    name: "Sarah Chen",
    handle: "@sarahbeats",
    text: "WavTrack has completely transformed my music production workflow. The analytics help me stay consistent and motivated!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    name: "Marcus Johnson",
    handle: "@marcusmusic",
    text: "The Pomodoro timer integration is genius. I've never been more focused during my studio sessions."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    name: "David Martinez",
    handle: "@davidproduces",
    text: "Finally, a tool that understands music producers. The project tracking and insights are exactly what I needed."
  },
];

const SignInPageDemo = () => {
  return (
    <div className="bg-background text-foreground">
      <SignInPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        testimonials={sampleTestimonials}
      />
    </div>
  );
};

export default SignInPageDemo; 