import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, Sparkles } from "lucide-react";

// Import gallery images
import gallerySunset from "@/assets/gallery-sunset.jpg";
import galleryFairy from "@/assets/gallery-fairy.jpg";
import galleryRenewable from "@/assets/gallery-renewable.jpg";
import galleryScientists from "@/assets/gallery-scientists.jpg";
import galleryEarth from "@/assets/gallery-earth.jpg";
import galleryClimate from "@/assets/gallery-climate.jpg";
import galleryArctic from "@/assets/gallery-arctic.jpg";

const galleryImages = [
  { id: 1, src: gallerySunset, alt: "Mountain sunset landscape" },
  { id: 2, src: galleryFairy, alt: "Anime fairy character" },
  { id: 3, src: galleryRenewable, alt: "Renewable energy technology" },
  { id: 4, src: galleryScientists, alt: "Environmental research" },
  { id: 5, src: galleryEarth, alt: "Environmental protection" },
  { id: 6, src: galleryClimate, alt: "Climate data visualization" },
  { id: 7, src: galleryArctic, alt: "Arctic glaciers" },
];

export default function ImageGenerator() {
  const [imageType, setImageType] = useState("Custom");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("Square");
  const [activeTab, setActiveTab] = useState("General");
  const [galleryTab, setGalleryTab] = useState("Gallery");

  const handleGenerateImage = () => {
    console.log("Generating image with:", { imageType, prompt, aspectRatio });
  };

  const handleReset = () => {
    setPrompt("");
    setAspectRatio("Square");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Image Generator
          </h1>
          <p className="text-muted-foreground">Create stunning images with AI technology</p>
        </div>

        <Card className="p-6 shadow-[var(--shadow-card)]">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="General" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                General
              </TabsTrigger>
              <TabsTrigger value="Advanced" className="data-[state=inactive]:bg-secondary">
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="General" className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="imageType">Type of Image</Label>
                <Select value={imageType} onValueChange={setImageType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select image type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Custom">Custom</SelectItem>
                    <SelectItem value="Portrait">Portrait</SelectItem>
                    <SelectItem value="Landscape">Landscape</SelectItem>
                    <SelectItem value="Abstract">Abstract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prompt">
                  Image Prompt <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="prompt"
                    placeholder="Describe the image you want to create. Include visuals, text, subjects, and setting. If uploading images, explain how to use them."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                  />
                  <Badge variant="secondary" className="absolute bottom-2 right-2 text-xs">
                    {prompt.length}/1000
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Aspect Ratio <span className="text-destructive">*</span></Label>
                <div className="flex gap-3">
                  {["Square", "Landscape", "Portrait"].map((ratio) => (
                    <Button
                      key={ratio}
                      variant={aspectRatio === ratio ? "default" : "outline"}
                      onClick={() => setAspectRatio(ratio)}
                      className={aspectRatio === ratio ? "shadow-[var(--shadow-button)]" : ""}
                    >
                      {ratio}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleReset}>
                  Reset
                </Button>
                <Button 
                  onClick={handleGenerateImage} 
                  className="flex-1 shadow-[var(--shadow-button)]"
                  disabled={!prompt.trim()}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate Image
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="Advanced" className="space-y-6">
              <div className="text-center py-8 text-muted-foreground">
                Advanced settings coming soon...
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <Card className="p-6 shadow-[var(--shadow-card)]">
          <Tabs value={galleryTab} onValueChange={setGalleryTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="Example" className="data-[state=inactive]:bg-secondary">
                Example
              </TabsTrigger>
              <TabsTrigger value="Gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Gallery
              </TabsTrigger>
            </TabsList>

            <TabsContent value="Example" className="space-y-6">
              <div className="text-center py-8 text-muted-foreground">
                Example prompts and templates coming soon...
              </div>
            </TabsContent>

            <TabsContent value="Gallery" className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1 flex items-center justify-center gap-2">
                  Your Gallery
                  <span className="text-2xl">↓</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-200 shadow-[var(--shadow-card)]">
                    <div className="aspect-square relative">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-200"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}