"use client";

import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IndexTtsDrawer({ open, onOpenChange }: Props) {
  const demoUrl = 'https://indexteam-indextts-2-demo.ms.show/?t=1769738053066&__theme=light&studio_token=5f6e2c8d-d192-4b11-b325-a8ccfabd7804&backend_url=/';

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Index‑TTS Demo</DrawerTitle>
        </DrawerHeader>

        <div className="p-4">
          <div className="mb-3 text-sm text-muted-foreground">Embedded demo (requires external site to allow iframe). If the demo doesn't load, open it in a new tab.</div>
          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
            <iframe
              src={demoUrl}
              title="Index‑TTS Demo"
              loading="lazy"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-modals"
              allow="microphone; autoplay"
            />
          </div>

          <div className="mt-4">
            <a href={demoUrl} target="_blank" rel="noreferrer">
              <Button variant="outline">在新窗口打开演示</Button>
            </a>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
