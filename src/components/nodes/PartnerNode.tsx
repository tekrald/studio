'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react'; // Using a generic User icon for partners

export type PartnerNodeData = {
  id: string;
  name: string;
  // Add any other partner-specific data you might need
};

export function PartnerNode({ id: nodeId, data, selected }: NodeProps<PartnerNodeData>) {
  return (
    <Card
      className={`w-56 shadow-lg border-2 ${selected ? 'border-primary shadow-primary/30' : 'border-border'} bg-card relative rounded-lg`}
      style={{ overflow: 'visible' }}
    >
      <Handle type="target" position={Position.Top} id={`t-${nodeId}-partner-top`} className="!opacity-50 !bg-ring" />

      <CardHeader className="p-3 border-b border-border">
        <div className="flex items-center">
          <User size={18} className="text-primary mr-2" />
          <CardTitle className="text-sm font-semibold text-card-foreground truncate" title={data.name}>
            {data.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-3 text-xs">
        <span className="text-muted-foreground italic">Partner</span>
      </CardContent>

      <Handle type="source" position={Position.Bottom} id={`s-${nodeId}-partner-bottom`} className="!opacity-50 !bg-ring" />
    </Card>
  );
}