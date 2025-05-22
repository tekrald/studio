
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Users, Baby, PersonStanding } from 'lucide-react'; // Added more icons

export type MemberNodeData = {
  name: string;
  relationshipType: string;
};

const getIconForMember = (data: MemberNodeData) => {
  const relTypeLower = data.relationshipType.toLowerCase();
  if (relTypeLower.includes('filho') || relTypeLower.includes('filha')) return <Baby size={18} className="text-accent mr-2" />;
  if (relTypeLower.includes('pai') || relTypeLower.includes('mãe')) return <PersonStanding size={18} className="text-accent mr-2" />;
  if (relTypeLower.includes('cônjuge') || relTypeLower.includes('parceiro')) return <Users size={18} className="text-accent mr-2" />;
  return <User size={18} className="text-accent mr-2" />;
};

export function MemberNode({ id, data, selected }: NodeProps<MemberNodeData>) {
  const icon = getIconForMember(data);
  return (
    <Card 
      className={`w-56 shadow-lg border-2 ${selected ? 'border-accent shadow-accent/40' : 'border-border'} bg-card relative rounded-lg`}
      style={{ overflow: 'visible' }}
    >
      <Handle type="target" position={Position.Top} className="!opacity-50 !bg-ring" />
      
      <CardHeader className="p-3 border-b border-border">
        <div className="flex items-center">
          {icon}
          <CardTitle className="text-sm font-semibold text-card-foreground truncate" title={data.name}>
            {data.name}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-3 text-xs">
        <Badge variant="outline" className="border-accent text-accent text-xs">
          {data.relationshipType}
        </Badge>
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="!opacity-50 !bg-ring" />
    </Card>
  );
}
