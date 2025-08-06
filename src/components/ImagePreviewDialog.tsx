import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Wand2, Copy, Settings, X, ChevronLeft, ChevronRight, Info } from "lucide-react";

interface ImagePreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  image: {
    id: number;
    src: string;
    alt: string;
    prompt?: string;
    aspectRatio?: string;
    quality?: string;
    model?: string;
    created?: string;
  };
  onPrevious: () => void;
  onNext: () => void;
}

export function ImagePreviewDialog({ 
  isOpen, 
  onClose, 
  image, 
  onPrevious, 
  onNext 
}: ImagePreviewDialogProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.src;
    link.download = `image-${image.id}.jpg`;
    link.click();
  };

  const handleCopyPrompt = () => {
    if (image.prompt) {
      navigator.clipboard.writeText(image.prompt);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[80vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Left side - Image (60%) */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={onPrevious}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
              onClick={onNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <img
              src={image.src}
              alt={image.alt}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Right side - Details (40%) */}
          <div className="w-2/5 bg-card p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 border border-border rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-sm" />
              </div>
              <h2 className="text-lg font-semibold">Image Details</h2>
            </div>

            <div className="space-y-6 flex-1">
              {/* Image Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-muted rounded-sm" />
                  <span className="text-sm font-medium">Image Description / Prompt</span>
                </div>
                <div className="relative">
                  <textarea
                    value={image.prompt || image.alt}
                    readOnly
                    className="w-full h-20 p-3 bg-muted rounded-lg border resize-none text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 w-6 h-6"
                    onClick={handleCopyPrompt}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="text-right text-xs text-muted-foreground">0/1000</div>
              </div>

              {/* Aspect Ratio & Quality */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded-sm" />
                    <span className="text-sm font-medium">Aspect Ratio</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {image.aspectRatio || "Square"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded-sm" />
                    <span className="text-sm font-medium">Quality</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {image.quality || "Basic"}
                  </div>
                </div>
              </div>

              {/* Model & Created */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded-sm" />
                    <span className="text-sm font-medium">Model</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {image.model || "Model C"}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-muted rounded-sm" />
                    <span className="text-sm font-medium">Created</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {image.created || "Jul 26, 2025 at 20:29"}
                  </div>
                </div>
              </div>

              {/* Edit Image Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button className="w-full shadow-[var(--shadow-button)]">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Edit Image
                      <Info className="w-3 h-3 ml-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Crop & Expand the Image to a different Ratio</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Credits Info */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs">
                  ¢
                </div>
                <span className="text-muted-foreground">Credits used: 0.74</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-6 border-t">
              <Button variant="outline" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Remove Bg
              </Button>
              <Button variant="outline" className="col-span-2">
                <Copy className="w-4 h-4 mr-2" />
                Remix
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}