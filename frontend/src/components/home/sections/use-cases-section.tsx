import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Image as ImageIcon, Film, Move3D } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface VideoExample {
  id: string;
  prompt: string;
  image: string;
  video: string;
  frames?: {
    first?: string;
    mid?: string;
    last?: string;
  };
  mask?: string;
}

const imageToVideoExamples: VideoExample[] = [
  {
    id: '1',
    prompt:
      'The figures in the picture are sitting in a forward moving car waving to the rear, their hair swaying from side to side in the wind',
    image: 'https://cdn.anisora.ai/examples/000000(225).png',
    video: 'https://cdn.anisora.ai/examples/000000(225).gif',
  },
  {
    id: '2',
    prompt:
      'The scene shows two figures in red wedding clothes holding a red rope as they walk off into the distance',
    image: 'https://cdn.anisora.ai/examples/000000(223).png',
    video: 'https://cdn.anisora.ai/examples/000000(223).gif',
  },
  {
    id: '3',
    prompt:
      "The yellow-haired figure reaches out to touch the head of the kneeling figure, and the kneeling figure's body rises and falls as he gasps for breath.",
    image: 'https://cdn.anisora.ai/examples/000000(232).png',
    video: 'https://cdn.anisora.ai/examples/000000(232).gif',
  },
];

const temporalControlExamples: VideoExample[] = [
  {
    id: 't1',
    prompt:
      'In this video we see a scene from the animated film Beauty and the Beast with Belle and the Beast. Belle, with long blonde hair, is standing in a room with large windows, looking out the window and talking to it. She is wearing a purple dress with a purple top...',
    image: 'https://cdn.anisora.ai/examples/cartoon_films_ren_wu_shuo_hua_34_firstmidlast_mid.png',
    video: 'https://cdn.anisora.ai/examples/cartoon_films_ren_wu_shuo_hua_34_firstmidlast.gif',
    frames: {
      first:
        'https://cdn.anisora.ai/examples/cartoon_films_ren_wu_shuo_hua_34_firstmidlast_first.png',
      mid: 'https://cdn.anisora.ai/examples/cartoon_films_ren_wu_shuo_hua_34_firstmidlast_mid.png',
      last: 'https://cdn.anisora.ai/examples/cartoon_films_ren_wu_shuo_hua_34_firstmidlast_last.png',
    },
  },
  {
    id: 't2',
    prompt:
      'In this video, a young woman with long blonde hair can be seen looking out from behind a car door at night. The car is parked under a starry sky with a full moon illuminating the scene. The woman appears to be in a state of worry, as evidenced by her facial expression and the way she grips the car door. ',
    image: 'https://cdn.anisora.ai/examples/motion_comics_tui_la_5_firstlast_first.png',
    video: 'https://cdn.anisora.ai/examples/motion_comics_tui_la_5_firstlast.gif',
    frames: {
      first: 'https://cdn.anisora.ai/examples/motion_comics_tui_la_5_firstlast_first.png',
      last: 'https://cdn.anisora.ai/examples/motion_comics_tui_la_5_firstlast_last.jpeg',
    },
  },
];

const spatialControlExamples: VideoExample[] = [
  {
    id: 's1',
    prompt:
      'In this vibrant underwater scene from the animated film Finding Nemo...',
    image: 'https://cdn.anisora.ai/examples/132.png',
    video: 'https://cdn.anisora.ai/examples/132.gif',
    mask: 'https://cdn.anisora.ai/examples/132_mask.png',
  },
];

export function UseCasesSection() {
  return (
    <section
      id="showcase"
      className="w-full py-12 md:py-24 lg:py-32 bg-background unoptimized flex flex-col items-center justify-center"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Explore AniSora's Capabilities
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Discover the power of AI-generated animation with our diverse range
            of examples
          </p>
        </div>

        <Tabs defaultValue="image-to-video" className="w-full overflow-hidden">
          <div className="flex justify-center mb-6 px-4 sm:px-0">
            <TabsList className="h-full grid w-full max-w-2xl grid-cols-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <TabsTrigger
                value="image-to-video"
                className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-200 
                  data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary 
                  data-[state=active]:border data-[state=active]:border-gray-200 
                  dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-900 
                  dark:data-[state=active]:text-white whitespace-nowrap"
              >
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium truncate">Image to Video</span>
              </TabsTrigger>
              <TabsTrigger
                value="temporal"
                className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-200 
                  data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary 
                  data-[state=active]:border data-[state=active]:border-gray-200 
                  dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-900 
                  dark:data-[state=active]:text-white whitespace-nowrap"
              >
                <Film className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium truncate">Temporal</span>
              </TabsTrigger>
              <TabsTrigger
                value="spatial"
                className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base rounded-lg transition-all duration-200 
                  data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary 
                  data-[state=active]:border data-[state=active]:border-gray-200 
                  dark:data-[state=active]:border-gray-700 dark:data-[state=active]:bg-gray-900 
                  dark:data-[state=active]:text-white whitespace-nowrap"
              >
                <Move3D className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="font-medium truncate">Spatial</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Image to Video Tab */}
          <TabsContent value="image-to-video">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {imageToVideoExamples.map((example) => (
                <VideoExampleCard
                  key={example.id}
                  example={example}
                  type="image-to-video"
                />
              ))}
            </div>
          </TabsContent>

          {/* Temporal Control Tab */}
          <TabsContent value="temporal">
            <div className="grid gap-6 md:grid-cols-2">
              {temporalControlExamples.map((example) => (
                <VideoExampleCard
                  key={example.id}
                  example={example}
                  type="temporal"
                />
              ))}
            </div>
          </TabsContent>

          {/* Spatial Control Tab */}
          <TabsContent value="spatial" className="mt-8">
            <div className="max-w-3xl mx-auto px-4">
              {spatialControlExamples.map((example) => (
                <VideoExampleCard
                  key={example.id}
                  example={example}
                  type="spatial"
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        {/* <div className="flex justify-center mt-6">
          <Link href="/examples" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors">
            <ImageIcon className="w-4 h-4" />
            See More Examples
          </Link>
        </div> */}
      </div>
    </section>
  );
}

interface VideoExampleCardProps {
  example: VideoExample;
  type: 'image-to-video' | 'temporal' | 'spatial';
}

function VideoExampleCard({ example, type }: VideoExampleCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      {/* <CardHeader>
        <CardTitle className="text-lg font-medium line-clamp-2 h-14">
          {example.prompt.split('.').shift()}
        </CardTitle>
      </CardHeader> */}
      <CardContent>
        <div className="space-y-4">
          {/* Main Media Area */}
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            {isPlaying ? (
              <Image
                src={example.video}
                alt={example.prompt}
                fill
                className="h-full w-full object-cover"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaying(false);
                }}
              />
            ) : (
              // 同时修改图片的点击事件
              <Image
                src={example.image}
                alt={example.prompt}
                fill
                className="object-cover cursor-pointer"
                onClick={() => setIsPlaying(true)}
                unoptimized // 如果使用本地 GIF 需要添加这个属性
              />
            )}
            {!isPlaying && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
                onClick={(e) => {
                  e.stopPropagation(); // 阻止事件冒泡
                  setIsPlaying(true);
                }}
                aria-label="Play video"
              >
                <Play className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Additional Frames for Temporal Control */}
          {type === 'temporal' && example.frames && (
            <div className="grid grid-cols-3 gap-2">
              {example.frames.first && (
                <div className="relative aspect-video overflow-hidden rounded border">
                  <Image
                    src={example.frames.first}
                    alt="First frame"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    First
                  </span>
                </div>
              )}
              {example.frames.mid && (
                <div className="relative aspect-video overflow-hidden rounded border">
                  <Image
                    src={example.frames.mid}
                    alt="Mid frame"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    Mid
                  </span>
                </div>
              )}
              {example.frames.last && (
                <div className="relative aspect-video overflow-hidden rounded border">
                  <Image
                    src={example.frames.last}
                    alt="Last frame"
                    fill
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                    Last
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mask for Spatial Control */}
          {type === 'spatial' && example.mask && (
            <div className="space-y-2">
              <div className="relative aspect-video overflow-hidden rounded border">
                <Image
                  src={example.mask}
                  alt="Motion mask"
                  fill
                  className="object-cover"
                />
                <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
                  Motion Mask
                </span>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground line-clamp-4">
            <span className="font-bold">prompt: </span>
            {example.prompt}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
