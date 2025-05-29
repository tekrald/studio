
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
      className={`w-56 shadow-lg border-2 ${selected ? 'border-primary shadow-primary/40' : 'border-border'} bg-card relative rounded-lg`}
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
        {/* Add any other partner-specific info or badges here if needed */}
        <span className="text-muted-foreground italic">Partner</span>
      </CardContent>

      {/* Optional: Add a source handle if partners can have things directly connected below them */}
      <Handle type="source" position={Position.Bottom} id={`s-${nodeId}-partner-bottom`} className="!opacity-50 !bg-ring" />
      {/* Optional: Allow assets to be directly linked to partners too? */}
      {/* <Handle type="target" position={Position.Bottom} id={`t-${nodeId}-partner-asset`} className="!opacity-50 !bg-ring !bottom-[-4px]" /> */}
    </Card>
  );
}
