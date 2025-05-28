'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Icons } from "@/components/icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api";

interface VideoResult {
  video_path: string;
  subtitle_path?: string;
  download_path: string;
  seed_used: number;
  duration: number;
}

interface GenerationError {
  message: string;
  details?: string;
}

interface VideoGenerationCardProps {
  className?: string;
}

export function VideoGenerationCard({ className }: VideoGenerationCardProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"text" | "image">("image");
  
  // 表单状态
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [duration, setDuration] = useState(5);
  const [motion, setMotion] = useState(1.3);
  const [speed, setSpeed] = useState<"原版" | "加速版">("加速版");
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<GenerationError | null>(null);

  // 处理图片上传
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证图片类型
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    // 设置图片预览
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setImage(file);
    setError(null);
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 验证表单
  const validateForm = (): boolean => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return false;
    }

    if (prompt.length > 1000) {
      toast.error("Prompt is too long (max 1000 characters)");
      return false;
    }

    if (activeTab === "image" && !image) {
      toast.error("Please upload an image");
      return false;
    }

    // 检查图片大小 (最大10MB)
    if (image && image.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return false;
    }

    return true;
  };

  // 上传图片到服务器
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
        credentials: 'include',  // Include cookies for authentication if needed
        // Don't set Content-Type header, let the browser set it with the correct boundary
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: `HTTP error! status: ${response.status}`
        }));
        throw new Error(errorData.detail || errorData.message || 'Failed to upload image');
      }

      const data = await response.json();
      
      // Make sure the URL is absolute
      let fileUrl = data.url;
      if (fileUrl && !fileUrl.startsWith('http')) {
        // If it's a relative URL, prepend the backend URL
        fileUrl = `http://localhost:8000${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
      }
      
      return fileUrl;
      
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to upload image');
    }
  };

  // 生成视频
  const handleGenerate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      let imageUrl = '';
      
      // 如果有图片，先上传
      if (image) {
        imageUrl = await uploadImage(image);
      }

      // 调用生成视频API
      const response = await fetch(API_ENDPOINTS.VIDEO.GENERATE, {
        method: 'POST',
        credentials: 'include',  // Include cookies for authentication if needed
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          duration: duration,
          motion: motion,
          speed: speed === '加速版' ? 'fast' : 'normal',
          image_url: imageUrl || undefined,
          model_id: 'anime-video',
          is_public: false
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to generate video');
      }

      const resultData = await response.json();
      
      // 开始轮询获取生成状态
      await pollGenerationStatus(resultData.id);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError({
        message: 'Generation failed',
        details: errorMessage,
      });
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // 轮询获取生成状态
  const pollGenerationStatus = async (generationId: string, retries = 30) => {
    try {
      for (let i = 0; i < retries; i++) {
        const response = await fetch(API_ENDPOINTS.VIDEO.STATUS(generationId), {
          credentials: 'include',  // Include cookies for authentication if needed
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to check generation status');
        }
        
        const statusData = await response.json();
        
        if (statusData.status === 'completed') {
          setResult({
            video_path: statusData.result_url,
            download_path: statusData.result_url,
            seed_used: statusData.seed_used || 0,
            duration: statusData.duration || duration,
          });
          toast.success('Video generated successfully!');
          return;
        }
        
        if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Generation failed');
        }
        
        // 每2秒轮询一次
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      throw new Error('Generation timed out');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate video';
      setError({
        message: 'Generation failed',
        details: errorMessage,
      });
      toast.error(errorMessage);
    }
  };

  // 重置表单
  const resetForm = () => {
    setPrompt('');
    setImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setDuration(5);
    setMotion(1.3);
    setSpeed('加速版');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // 处理标签页切换
  const handleTabChange = (value: string) => {
    setActiveTab(value as "text" | "image");
    // 不清空表单，保留用户输入
  };
  

  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow-sm p-6", className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        className="w-full"
      >
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
          
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Duration: {duration}s</Label>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                min={1}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Speed</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={speed === '原版' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSpeed('原版')}
                  className="flex-1"
                >
                  原版
                </Button>
                <Button
                  type="button"
                  variant={speed === '加速版' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSpeed('加速版')}
                  className="flex-1"
                >
                  加速版
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Motion: {motion.toFixed(1)}</Label>
              </div>
              <Slider
                value={[motion]}
                onValueChange={(value) => setMotion(value[0])}
                min={0.1}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values create more motion in the video
              </p>
            </div>
            
            <Button 
              className="w-full mt-4" 
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
        
        <TabsContent value="image" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the video you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Upload Image</Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            <div 
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors",
                imagePreview ? "border-primary/50" : ""
              )}
              onClick={triggerFileSelect}
            >
              {imagePreview ? (
                <div className="relative group">
                  <div className="relative w-full h-48">
                <Image 
                  src={imagePreview} 
                  alt="Preview" 
                  fill
                  className="rounded-md object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-md transition-opacity">
                    <Button variant="outline" size="sm">
                      <Icons.upload className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Icons.upload className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium">Drag and drop an image here</h3>
                  <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
                  <Button variant="outline" size="sm">
                    Select Image
                  </Button>
                </>
              )}
            </div>
            
            {image && (
              <p className="text-xs text-muted-foreground truncate">
                {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
          
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Duration: {duration}s</Label>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(value) => setDuration(value[0])}
                min={1}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Speed</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={speed === '原版' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSpeed('原版')}
                  className="flex-1"
                >
                  原版
                </Button>
                <Button
                  type="button"
                  variant={speed === '加速版' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSpeed('加速版')}
                  className="flex-1"
                >
                  加速版
                </Button>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Motion: {motion.toFixed(1)}</Label>
              </div>
              <Slider
                value={[motion]}
                onValueChange={(value) => setMotion(value[0])}
                min={0.1}
                max={2}
                step={0.1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Higher values create more motion in the video
              </p>
            </div>
            
            <Button 
              className="w-full mt-4" 
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || (activeTab === "image" && !image)}
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
      </Tabs>
      
      {/* Result Section */}
      {result && (
        <div className="mt-8 border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Generated Video</h3>
          <div className="rounded-lg overflow-hidden bg-black">
            <video 
              src={result.video_path} 
              controls 
              className="w-full aspect-video"
              autoPlay
              loop
              muted
            />
          </div>
          <div className="mt-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Seed: {result.seed_used} • {result.duration}s • {speed}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={result.download_path} download>
                  <Icons.download className="mr-2 h-4 w-4" />
                  Download
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={resetForm}>
                <Icons.refresh className="mr-2 h-4 w-4" />
                Create Another
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
          <div className="flex items-center gap-2">
            <Icons.alertCircle className="h-5 w-5" />
            <h4 className="font-medium">{error.message}</h4>
          </div>
          {error.details && (
            <p className="mt-2 text-sm">{error.details}</p>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}
    </div>
  );

}
