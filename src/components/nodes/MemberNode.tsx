
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Users, Baby, PersonStanding, PlusCircle } from 'lucide-react';

export type MemberNodeData = {
  id: string;
  name: string;
  relationshipType: string; // e.g., 'filho_a'
  onAddAssetClick?: (memberId: string) => void;
};

const getIconForMember = (data: MemberNodeData) => {
  const relTypeLower = data.relationshipType.toLowerCase();
  // Assuming 'filho_a' means child. Translate other relationship types if needed.
  if (relTypeLower.includes('filho_a') || relTypeLower.includes('child')) return <Baby size={18} className="text-accent mr-2" />;
  if (relTypeLower.includes('pai') || relTypeLower.includes('mae') || relTypeLower.includes('parent')) return <PersonStanding size={18} className="text-accent mr-2" />;
  if (relTypeLower.includes('cônjuge') || relTypeLower.includes('parceiro') || relTypeLower.includes('spouse') || relTypeLower.includes('partner')) return <Users size={18} className="text-accent mr-2" />;
  return <User size={18} className="text-accent mr-2" />;
};

// Helper to get a displayable relationship type
const getDisplayRelationship = (relationshipType: string) => {
    if (relationshipType === 'filho_a') return 'Child';
    // Add more translations as needed
    return relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1);
}

export function MemberNode({ id: nodeId, data, selected }: NodeProps<MemberNodeData>) {
  const icon = getIconForMember(data);

  const handleAddAsset = () => {
    if (data.onAddAssetClick) {
      data.onAddAssetClick(data.id); 
    }
  };

  return (
    <Card
      className={`w-56 shadow-lg border-2 ${selected ? 'border-accent shadow-accent/40' : 'border-border'} bg-card relative rounded-lg`}
      style={{ overflow: 'visible' }}
    >
      <Handle type="target" position={Position.Top} id={`t-${nodeId}-top`} className="!opacity-50 !bg-ring" />

      <CardHeader className="p-3 border-b border-border">
        <div className="flex items-center">
          {icon}
          <CardTitle className="text-sm font-semibold text-card-foreground truncate" title={data.name}>
            {data.name}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-3 text-xs">
        <Badge variant="outline" className="border-accent/50 text-accent text-xs">
          {getDisplayRelationship(data.relationshipType)}
        </Badge>
      </CardContent>

      {data.onAddAssetClick && (
         <div className="absolute -bottom-3.5 left-1/2 transform -translate-x-1/2 z-10">
            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-card hover:bg-muted border-dashed border-accent text-accent hover:text-accent/90 rounded-full shadow"
                onClick={handleAddAsset}
                aria-label="Add Asset to this Member"
            >
                <PlusCircle size={16} />
            </Button>
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id={`s-${nodeId}-bottom`} className="!opacity-50 !bg-ring" />
      <Handle type="target" position={Position.Bottom} id={`t-${nodeId}-bottom`} className="!opacity-50 !bg-ring !bottom-[-4px]" />
    </Card>
  );
}
