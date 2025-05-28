'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoGenerationCard } from "@/components/video/generation-card";
import { Icons } from "@/components/icons";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("video");

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AniSora Studio</h1>
          <p className="text-muted-foreground">
            Create amazing AI-generated videos with AniSora
          </p>
        </div>
        <Button>
          <Icons.plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="video">Video Generation</TabsTrigger>
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Left: Generation Form */}
            <div className="lg:col-span-2 space-y-6">
              <VideoGenerationCard />
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Generation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Icons.history className="mx-auto h-8 w-8 mb-2" />
                    <p>Your generation history will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right: Preview Section */}
            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Generated video will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Icons.lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                    <p>Be specific with your prompts for better results</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                    <p>Use negative prompts to exclude unwanted elements</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
                    <p>Longer videos may take more time to generate</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="projects">
          <div className="text-center py-12">
            <Icons.folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No projects yet</h3>
            <p className="text-muted-foreground mt-2">
              Create your first project to get started
            </p>
            <Button className="mt-4">
              <Icons.plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="community">
          <div className="text-center py-12">
            <Icons.users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Community Feed</h3>
            <p className="text-muted-foreground mt-2">
              Explore videos created by the community
            </p>
            <Button variant="outline" className="mt-4">
              Browse Community
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
