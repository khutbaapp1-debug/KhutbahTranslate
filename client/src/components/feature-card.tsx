import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  backgroundImage?: string;
  onExplore: () => void;
  isPremium?: boolean;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  backgroundImage,
  onExplore,
  isPremium = false,
}: FeatureCardProps) {
  return (
    <Card
      className="min-w-[85vw] md:min-w-[400px] snap-center overflow-hidden relative h-[280px] flex flex-col"
      data-testid={`card-feature-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
        </div>
      )}
      
      <div className="relative flex flex-col p-8 h-full justify-between">
        <div className="flex flex-col items-start gap-4">
          <div className={`p-4 rounded-lg ${backgroundImage ? 'bg-white/10 backdrop-blur-md' : 'bg-primary/10'}`}>
            <Icon className={`w-10 h-10 ${backgroundImage ? 'text-white' : 'text-primary'}`} />
          </div>
          
          <div className="space-y-2">
            <h3 className={`text-2xl font-semibold ${backgroundImage ? 'text-white' : 'text-foreground'}`}>
              {title}
              {isPremium && (
                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                  Premium
                </span>
              )}
            </h3>
            <p className={`text-sm ${backgroundImage ? 'text-white/90' : 'text-muted-foreground'}`}>
              {description}
            </p>
          </div>
        </div>

        <Button
          onClick={onExplore}
          variant={backgroundImage ? "outline" : "default"}
          className={backgroundImage ? "backdrop-blur-md bg-white/20 text-white border-white/30 hover:bg-white/30" : ""}
          data-testid={`button-explore-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          Explore
        </Button>
      </div>
    </Card>
  );
}
