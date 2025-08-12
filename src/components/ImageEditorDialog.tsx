import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
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
  onExpand: (targetDimensions: { width: number; height: number }, originalImage: any) => void;
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
  image,
  onExpand
}: ImageEditorDialogProps) {
  const [isAspectRatioOpen, setIsAspectRatioOpen] = useState(true);
  const [isCustomSizeOpen, setIsCustomSizeOpen] = useState(false);
  const [isContentEditingOpen, setIsContentEditingOpen] = useState(false);
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
  
  // Erase feature state
  const [isMasking, setIsMasking] = useState(false);
  const [maskPaths, setMaskPaths] = useState<Array<{x: number, y: number}[]>>([]);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushPosition, setBrushPosition] = useState({ x: 0, y: 0, visible: false });
  const [brushSize, setBrushSize] = useState<number>(20);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generative Fill state
  const [generativeFillPrompt, setGenerativeFillPrompt] = useState("");

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

  // Toggle sections - only one can be open at a time
  const handleAspectRatioToggle = () => {
    setIsAspectRatioOpen(!isAspectRatioOpen);
    if (!isAspectRatioOpen) {
      setIsCustomSizeOpen(false);
      setIsContentEditingOpen(false);
    }
  };
  
  const handleCustomSizeToggle = () => {
    setIsCustomSizeOpen(!isCustomSizeOpen);
    if (!isCustomSizeOpen) {
      setIsAspectRatioOpen(false);
      setIsContentEditingOpen(false);
    }
  };
  
  const handleContentEditingToggle = () => {
    setIsContentEditingOpen(!isContentEditingOpen);
    if (!isContentEditingOpen) {
      setIsAspectRatioOpen(false);
      setIsCustomSizeOpen(false);
      // Reset canvas to original dimensions when switching to Content Editing
      setTargetDimensions(originalDimensions);
      setCustomWidth(originalDimensions.width);
      setCustomHeight(originalDimensions.height);
      // Clear any existing masks and prompt
      setMaskPaths([]);
      setCurrentPath([]);
      setIsMasking(false);
      setGenerativeFillPrompt("");
    }
  };

  // Calculate canvas preview dimensions for display
  const getCanvasPreviewDimensions = () => {
    const maxDisplaySize = 400;
    const aspectRatio = targetDimensions.width / targetDimensions.height;
    
    let displayWidth, displayHeight;
    if (aspectRatio > 1) {
      displayWidth = Math.min(maxDisplaySize, targetDimensions.width);
      displayHeight = displayWidth / aspectRatio;
    } else {
      displayHeight = Math.min(maxDisplaySize, targetDimensions.height);
      displayWidth = displayHeight * aspectRatio;
    }
    
    return { displayWidth, displayHeight };
  };

  // Calculate image positioning within canvas
  const getImagePositioning = () => {
    const { displayWidth, displayHeight } = getCanvasPreviewDimensions();
    const origAspect = originalDimensions.width / originalDimensions.height;
    
    let imageDisplayWidth, imageDisplayHeight;
    if (origAspect > 1) {
      imageDisplayWidth = Math.min(displayWidth, displayHeight * origAspect);
      imageDisplayHeight = imageDisplayWidth / origAspect;
    } else {
      imageDisplayHeight = Math.min(displayHeight, displayWidth / origAspect);
      imageDisplayWidth = imageDisplayHeight * origAspect;
    }
    
    return { imageDisplayWidth, imageDisplayHeight };
  };

  // Erase feature handlers
  const handleStartMasking = () => {
    setIsMasking(!isMasking);
    if (isMasking) {
      setBrushPosition(prev => ({ ...prev, visible: false }));
    }
  };

  const handleClearMask = () => {
    setMaskPaths([]);
    setCurrentPath([]);
  };

  const handleErase = () => {
    onExpand(targetDimensions, { ...image, maskPaths });
    onClose();
  };

  const hasMask = maskPaths.length > 0;
  const hasPrompt = generativeFillPrompt.trim().length > 0;

  // Generative Fill handlers
  const handleGenerate = () => {
    onExpand(targetDimensions, { ...image, maskPaths, prompt: generativeFillPrompt });
    onClose();
  };

  // Canvas mouse event handlers
  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isMasking) {
      setBrushPosition({ x, y, visible: true });
      
      if (isDrawing) {
        setCurrentPath(prev => [...prev, { x, y }]);
      }
    }
  }, [isMasking, isDrawing]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isMasking) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
  }, [isMasking]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!isMasking || !isDrawing) return;
    
    setIsDrawing(false);
    if (currentPath.length > 0) {
      setMaskPaths(prev => [...prev, currentPath]);
      setCurrentPath([]);
    }
  }, [isMasking, isDrawing, currentPath]);

  const handleCanvasMouseLeave = useCallback(() => {
    setBrushPosition(prev => ({ ...prev, visible: false }));
    if (isDrawing) {
      setIsDrawing(false);
      if (currentPath.length > 0) {
        setMaskPaths(prev => [...prev, currentPath]);
        setCurrentPath([]);
      }
    }
  }, [isDrawing, currentPath]);
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[80vh] p-0 gap-0">
        <div className="flex h-full">
          {/* Left side - Canvas (60%) */}
          <div className="flex-1 relative flex items-center justify-center bg-slate-100 p-8">
            {(() => {
              const { displayWidth, displayHeight } = getCanvasPreviewDimensions();
              const { imageDisplayWidth, imageDisplayHeight } = getImagePositioning();
              
              return (
                <div className="relative">
                  {/* Canvas container with target dimensions */}
                  <div 
                    ref={canvasRef}
                    className="relative border-2 border-dashed border-gray-400 bg-white cursor-crosshair"
                    style={{
                      width: displayWidth,
                      height: displayHeight,
                      backgroundImage: `
                        linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                        linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                        linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)
                      `,
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                    }}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseLeave}
                  >
                    {/* Original image centered within canvas */}
                    <img 
                      src={image.src} 
                      alt={image.alt} 
                      className="absolute pointer-events-none"
                      style={{
                        width: imageDisplayWidth,
                        height: imageDisplayHeight,
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        objectFit: 'contain',
                        border: '2px solid rgba(0,0,0,0.1)'
                      }} 
                    />

                    {/* Mask overlay */}
                    <svg 
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Completed mask paths */}
                      {maskPaths.map((path, pathIndex) => (
                        <g key={pathIndex}>
                          <path
                            d={`M ${path.map(point => `${point.x},${point.y}`).join(' L ')}`}
                            stroke="rgba(255, 99, 132, 0.8)"
                            strokeWidth={brushSize}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                          <path
                            d={`M ${path.map(point => `${point.x},${point.y}`).join(' L ')}`}
                            stroke="rgba(255, 99, 132, 0.3)"
                            strokeWidth={Math.max(brushSize - 4, 1)}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </g>
                      ))}
                      
                      {/* Current drawing path */}
                      {currentPath.length > 1 && (
                        <g>
                          <path
                            d={`M ${currentPath.map(point => `${point.x},${point.y}`).join(' L ')}`}
                            stroke="rgba(255, 99, 132, 0.8)"
                            strokeWidth={brushSize}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                          <path
                            d={`M ${currentPath.map(point => `${point.x},${point.y}`).join(' L ')}`}
                            stroke="rgba(255, 99, 132, 0.3)"
                            strokeWidth={Math.max(brushSize - 4, 1)}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                          />
                        </g>
                      )}
                    </svg>

                    {/* Brush cursor */}
                    {isMasking && brushPosition.visible && (
                      <div
                        className="absolute pointer-events-none border-2 border-red-400 rounded-full"
                        style={{
                          width: `${brushSize}px`,
                          height: `${brushSize}px`,
                          left: brushPosition.x - brushSize / 2,
                          top: brushPosition.y - brushSize / 2,
                          backgroundColor: 'rgba(255, 99, 132, 0.2)'
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })()}

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

            <div className="space-y-6 flex-1">
              {/* Resize Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Resize</h3>
                  <Separator />
                </div>
                
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
                    <Button 
                      className="w-full"
                      onClick={() => {
                        onExpand(targetDimensions, image);
                        onClose();
                      }}
                    >
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
                    <Button 
                      className="w-full"
                      onClick={() => {
                        onExpand({ width: customWidth, height: customHeight }, image);
                        onClose();
                      }}
                    >
                      Expand Image
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Content Editing Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Content Editing</h3>
                  <Separator />
                </div>
                
                {/* Content Editing Section */}
                <Collapsible open={isContentEditingOpen} onOpenChange={handleContentEditingToggle}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <span className="text-base font-medium">Content Editing</span>
                      {isContentEditingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <div className="text-sm text-muted-foreground">
                      Remove or add content to your image by masking areas and choosing your action.
                    </div>
                    
                    {/* Masking controls */}
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          variant={isMasking ? "default" : "outline"}
                          size="sm"
                          onClick={handleStartMasking}
                          className="flex-1"
                        >
                          {isMasking ? "Stop Masking" : "Start Masking"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearMask}
                          disabled={!hasMask}
                          className="flex-1"
                        >
                          Clear Mask
                        </Button>
                      </div>
                      
                      {/* Brush size controller */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Brush size</label>
                        <div className="flex items-center gap-3">
                          <Slider value={[brushSize]} onValueChange={(v) => setBrushSize(v[0])} min={4} max={100} step={1} className="flex-1" aria-label="Brush size" />
                          <Badge variant="secondary">{brushSize}px</Badge>
                        </div>
                      </div>
                      
                      {/* Prompt textarea for Generative Fill */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Generate content (optional)</label>
                        <div className="relative">
                          <Textarea
                            value={generativeFillPrompt}
                            onChange={(e) => setGenerativeFillPrompt(e.target.value)}
                            placeholder="Describe what you want to generate in the masked area..."
                            className="w-full h-20 p-3 bg-muted rounded-lg border resize-none text-sm"
                            maxLength={1000}
                          />
                          <Badge 
                            variant="secondary" 
                            className="absolute bottom-2 right-2 text-xs"
                          >
                            {generativeFillPrompt.length}/1000
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleErase}
                          disabled={!hasMask}
                        >
                          Erase
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleGenerate}
                          disabled={!hasMask || !hasPrompt}
                        >
                          Generate
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>;
}