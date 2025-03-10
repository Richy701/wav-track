import { useState, useEffect } from 'react';
import { Quote, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const quotes = [
  {
    text: "The music is not in the notes, but in the silence between.",
    author: "Wolfgang Amadeus Mozart"
  },
  {
    text: "Your music is a reflection of your soul. Make it beautiful.",
    author: "Unknown"
  },
  {
    text: "Music gives a soul to the universe, wings to the mind, flight to the imagination.",
    author: "Plato"
  },
  {
    text: "One good thing about music, when it hits you, you feel no pain.",
    author: "Bob Marley"
  },
  {
    text: "Without music, life would be a mistake.",
    author: "Friedrich Nietzsche"
  },
  {
    text: "Music is the strongest form of magic.",
    author: "Marilyn Manson"
  },
  {
    text: "The only truth is music.",
    author: "Jack Kerouac"
  },
  {
    text: "If you're not doing what you love, you're wasting your time.",
    author: "Billy Joel"
  },
  {
    text: "Music is a higher revelation than all wisdom and philosophy.",
    author: "Ludwig van Beethoven"
  },
  {
    text: "The more you create, the more creative you become.",
    author: "Unknown"
  },
  {
    text: "If it sounds good, it is good.",
    author: "Duke Ellington"
  },
  {
    text: "Trust your ear. If something sounds good to you, it is good.",
    author: "Rick Rubin"
  }
];

export function MotivationalQuotes() {
  const [quote, setQuote] = useState<typeof quotes[0]>({ text: "", author: "" });
  const [fadeIn, setFadeIn] = useState(true);

  // Get a random quote that's different from the current one
  const getRandomQuote = () => {
    const filteredQuotes = quotes.filter(q => q.text !== quote.text);
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    return filteredQuotes[randomIndex];
  };

  // Initialize with a random quote
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  // Change quote with animation
  const changeQuote = () => {
    setFadeIn(false);
    setTimeout(() => {
      setQuote(getRandomQuote());
      setFadeIn(true);
    }, 300);
  };

  return (
    <div className="bg-card rounded-lg p-3 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-sm">Daily Inspiration</h3>
        <button
          onClick={changeQuote}
          className="text-primary hover:text-primary/80 transition-colors"
          title="Get new quote"
        >
          <Sparkles size={14} />
        </button>
      </div>
      
      <div 
        className={cn(
          "transition-opacity duration-300", 
          fadeIn ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <Quote className="h-4 w-4 text-primary/70" />
          <p className="text-base leading-relaxed italic font-medium">{quote.text}</p>
        </div>
        <p className="text-xs text-muted-foreground ml-6">— {quote.author}</p>
      </div>
    </div>
  );
}
