'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";

export function VideoGenerationCard() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState(4);
  const [isPublic, setIsPublic] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      // TODO: 调用生成API
      console.log({ prompt, negativePrompt, duration, isPublic });
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Text to Video</TabsTrigger>
          <TabsTrigger value="image">Image to Video</TabsTrigger>
        </TabsList>
        
        <TabsContent value="text" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the video you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="negative-prompt">Negative Prompt (Optional)</Label>
              <span className="text-xs text-muted-foreground">What you don't want to see</span>
            </div>
            <Textarea
              id="negative-prompt"
              placeholder="Low quality, blurry, distorted"
              value={negativePrompt}
              onChange={(e) => setNegativePrompt(e.target.value)}
            />
          </div>
          
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Duration: {duration}s</Label>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                min={2}
                max={10}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center justify-between rounded-md border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="public-mode">Public</Label>
                <p className="text-sm text-muted-foreground">
                  Make this generation public in the community
                </p>
              </div>
              <Switch 
                id="public-mode" 
                checked={isPublic} 
                onCheckedChange={setIsPublic} 
              />
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Video'
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="image" className="mt-4">
          <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed p-12 text-center">
            <Icons.upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop an image here, or click to upload
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              Select Image
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
