
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

export type WalletNodeData = {
  id: string;
  label: string;
  // onSettingsClick is handled internally by router.push
};

export function WalletNode({ id: nodeId, data, selected }: NodeProps<WalletNodeData>) {
  const router = useRouter();

  const handleSettingsClick = () => {
    router.push('/wallet');
  };

  return (
    <Card
      className={`w-56 shadow-md border-2 ${selected ? 'border-accent shadow-accent/30' : 'border-border'} bg-card relative rounded-lg`}
      style={{ overflow: 'visible' }}
    >
      <Handle type="target" position={Position.Top} id={`t-${nodeId}-wallet-top`} className="!opacity-50 !bg-ring" />

      <CardHeader className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <WalletIcon size={18} className="text-accent mr-2" />
            <CardTitle className="text-sm font-semibold text-card-foreground truncate" title={data.label}>
              {data.label}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-accent"
            onClick={handleSettingsClick}
            aria-label="Wallet Settings"
          >
            <Settings size={14} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3 text-xs">
        <p className="text-muted-foreground">Contains union's digital assets.</p>
      </CardContent>

      <Handle type="source" position={Position.Bottom} id={`s-${nodeId}-wallet-bottom`} className="!opacity-50 !bg-ring" />
    </Card>
  );
}
