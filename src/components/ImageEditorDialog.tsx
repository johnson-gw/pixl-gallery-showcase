import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { X, ChevronDown, ChevronUp } from "lucide-react";
interface ImageEditorDialogProps {
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
}
interface AspectRatioOption {
  label: string;
  ratio: [number, number];
}
const aspectRatios: AspectRatioOption[] = [{
  label: "Original",
  ratio: [1, 1]
}, {
  label: "1:1",
  ratio: [1, 1]
}, {
  label: "2:3",
  ratio: [2, 3]
}, {
  label: "3:2",
  ratio: [3, 2]
}, {
  label: "4:3",
  ratio: [4, 3]
}, {
  label: "3:4",
  ratio: [3, 4]
}, {
  label: "5:4",
  ratio: [5, 4]
}, {
  label: "4:5",
  ratio: [4, 5]
}, {
  label: "16:9",
  ratio: [16, 9]
}, {
  label: "9:16",
  ratio: [9, 16]
}];
export function ImageEditorDialog({
  isOpen,
  onClose,
  image
}: ImageEditorDialogProps) {
  const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(true);
  const [isCustomSizeOpen, setIsCustomSizeOpen] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioOption>(aspectRatios[0]);
  const [originalDimensions, setOriginalDimensions] = useState({
    width: 512,
    height: 512
  });
  const [targetDimensions, setTargetDimensions] = useState({
    width: 512,
    height: 512
  });
  const [customWidth, setCustomWidth] = useState(512);
  const [customHeight, setCustomHeight] = useState(512);

  // Load image to get original dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      setTargetDimensions({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      setCustomWidth(img.naturalWidth);
      setCustomHeight(img.naturalHeight);
    };
    img.src = image.src;
  }, [image.src]);

  // Calculate new dimensions based on aspect ratio
  const calculateDimensionsFromRatio = (ratio: [number, number]) => {
    const [ratioW, ratioH] = ratio;
    const {
      width: origW,
      height: origH
    } = originalDimensions;
    if (ratio[0] === 1 && ratio[1] === 1 && selectedRatio.label === "Original") {
      return {
        width: origW,
        height: origH
      };
    }

    // Keep the longer dimension, calculate the shorter one
    const origAspect = origW / origH;
    const targetAspect = ratioW / ratioH;
    let newWidth, newHeight;
    if (targetAspect > origAspect) {
      // Target is wider, keep original height, expand width
      newHeight = origH;
      newWidth = Math.round(origH * targetAspect);
    } else {
      // Target is taller or same, keep original width, expand height
      newWidth = origW;
      newHeight = Math.round(origW / targetAspect);
    }
    return {
      width: newWidth,
      height: newHeight
    };
  };

  // Handle aspect ratio selection
  const handleRatioSelect = (ratio: AspectRatioOption) => {
    setSelectedRatio(ratio);
    const newDimensions = calculateDimensionsFromRatio(ratio.ratio);
    setTargetDimensions(newDimensions);
    setCustomWidth(newDimensions.width);
    setCustomHeight(newDimensions.height);
  };

  // Handle custom size changes
  const handleCustomSizeChange = (width: number, height: number) => {
    setCustomWidth(width);
    setCustomHeight(height);
    setTargetDimensions({
      width,
      height
    });
  };

  // Toggle sections
  const handleAspectRatioToggle = () => {
    setIsAspectRatioOpen(!isAspectRatioOpen);
    if (!isAspectRatioOpen) {
      setIsCustomSizeOpen(false);
    }
  };
  const handleCustomSizeToggle = () => {
    setIsCustomSizeOpen(!isCustomSizeOpen);
    if (!isCustomSizeOpen) {
      setIsAspectRatioOpen(false);
    }
  };

  // Generate chess pattern style for expanded areas
  const getChessPatternStyle = () => {
    const origW = originalDimensions.width;
    const origH = originalDimensions.height;
    const targetW = targetDimensions.width;
    const targetH = targetDimensions.height;
    const scaleX = targetW / origW;
    const scaleY = targetH / origH;
    return {
      backgroundImage: `
        linear-gradient(45deg, #ccc 25%, transparent 25%), 
        linear-gradient(-45deg, #ccc 25%, transparent 25%), 
        linear-gradient(45deg, transparent 75%, #ccc 75%), 
        linear-gradient(-45deg, transparent 75%, #ccc 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
    };
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[80vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Left side - Canvas (60%) */}
          <div className="flex-1 relative flex items-center justify-center bg-slate-100 p-8">
            

            <div className="relative">
              {/* Chess pattern background for expanded areas */}
              <div className="absolute inset-0 -m-16 opacity-50" style={{
              ...getChessPatternStyle(),
              width: `${targetDimensions.width / originalDimensions.width * 100}%`,
              height: `${targetDimensions.height / originalDimensions.height * 100}%`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '400px',
              maxHeight: '400px'
            }} />
              
              {/* Original image */}
              <img src={image.src} alt={image.alt} className="relative z-10 max-w-[400px] max-h-[400px] object-contain" style={{
              boxShadow: '0 0 0 2px rgba(0,0,0,0.1)'
            }} />
            </div>

            {/* Dimension display */}
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
              {targetDimensions.width} × {targetDimensions.height}
            </div>
          </div>

          {/* Right side - Controls (40%) */}
          <div className="w-2/5 bg-card p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-6 h-6 border border-border rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-sm" />
              </div>
              <h2 className="text-lg font-semibold">Edit Image</h2>
            </div>

            <div className="space-y-4 flex-1">
              {/* Aspect Ratio Section */}
              <Collapsible open={isAspectRatioOpen} onOpenChange={handleAspectRatioToggle}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="text-base font-medium">Aspect Ratio</span>
                    {isAspectRatioOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-3 gap-2">
                    {aspectRatios.map(ratio => <Button key={ratio.label} variant={selectedRatio.label === ratio.label ? "default" : "outline"} size="sm" onClick={() => handleRatioSelect(ratio)} className="text-xs">
                        {ratio.label}
                      </Button>)}
                  </div>
                  <Button className="w-full">
                    Expand Image
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* Custom Size Section */}
              <Collapsible open={isCustomSizeOpen} onOpenChange={handleCustomSizeToggle}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                    <span className="text-base font-medium">Custom Size</span>
                    {isCustomSizeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Width</label>
                      <div className="flex items-center gap-2">
                        <Input type="number" value={customWidth} onChange={e => handleCustomSizeChange(parseInt(e.target.value) || 0, customHeight)} className="flex-1" />
                        <span className="text-sm text-muted-foreground">px</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Height</label>
                      <div className="flex items-center gap-2">
                        <Input type="number" value={customHeight} onChange={e => handleCustomSizeChange(customWidth, parseInt(e.target.value) || 0)} className="flex-1" />
                        <span className="text-sm text-muted-foreground">px</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">
                    Expand Image
                  </Button>
                </CollapsibleContent>
              </Collapsible>

              {/* Original Size Info */}
              <div className="pt-4 border-t space-y-2">
                <div className="text-sm font-medium">Original Size</div>
                <div className="text-sm text-muted-foreground">
                  {originalDimensions.width} × {originalDimensions.height} pixels
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}