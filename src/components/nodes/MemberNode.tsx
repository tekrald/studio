
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Users, Baby, PersonStanding, PlusCircle } from 'lucide-react';

export type MemberNodeData = {
  id: string; // Adicionado id para passar para onAddAssetClick
  name: string;
  relationshipType: string;
  onAddAssetClick?: (memberId: string) => void; // Callback para adicionar ativo a este membro
};

const getIconForMember = (data: MemberNodeData) => {
  const relTypeLower = data.relationshipType.toLowerCase();
  if (relTypeLower.includes('filho') || relTypeLower.includes('filha')) return <Baby size={18} className="text-accent mr-2" />;
  if (relTypeLower.includes('pai') || relTypeLower.includes('mãe')) return <PersonStanding size={18} className="text-accent mr-2" />;
  if (relTypeLower.includes('cônjuge') || relTypeLower.includes('parceiro')) return <Users size={18} className="text-accent mr-2" />;
  return <User size={18} className="text-accent mr-2" />;
};

export function MemberNode({ id: nodeId, data, selected }: NodeProps<MemberNodeData>) { // Renomeado id para nodeId para evitar conflito com data.id
  const icon = getIconForMember(data);

  const handleAddAsset = () => {
    if (data.onAddAssetClick) {
      data.onAddAssetClick(data.id); // Passa o ID do membro dos dados do nó
    }
  };

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

      {data.onAddAssetClick && (
         <div className="absolute -bottom-3.5 left-1/2 transform -translate-x-1/2 z-10">
            <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-card hover:bg-muted border-dashed border-accent text-accent hover:text-accent/90 rounded-full shadow"
                onClick={handleAddAsset}
                aria-label="Adicionar Ativo a este Membro"
            >
                <PlusCircle size={16} />
            </Button>
        </div>
      )}
      {/* Assegurando que os IDs dos Handles são únicos por nó, mas consistentes */}
      <Handle type="source" position={Position.Bottom} id={`s-${nodeId}`} className="!opacity-50 !bg-ring" />
      <Handle type="target" position={Position.Bottom} id={`t-${nodeId}`} className="!opacity-50 !bg-ring !bottom-[-4px]" />
    </Card>
  );
}
