
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Coins, Landmark, Building, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type AssetNodeData = {
  name: string;
  assetMainType: 'digital' | 'fisico';
  // Digital asset specific
  digitalAssetType?: string;
  quantity?: number;
  // Physical asset specific
  physicalAssetType?: string;
  // Release condition
  releaseCondition?: { type: 'age'; targetAge: number };
  assignedToMemberId?: string; // Para saber a quem está designado
};

const getIconForAsset = (data: AssetNodeData) => {
  if (data.assetMainType === 'digital') {
    if (data.digitalAssetType?.toLowerCase().includes('cripto')) return <Coins size={18} className="text-primary mr-2" />;
    if (data.digitalAssetType?.toLowerCase().includes('nft')) return <DollarSign size={18} className="text-primary mr-2" />;
    return <Coins size={18} className="text-primary mr-2" />;
  }
  if (data.assetMainType === 'fisico') {
    if (data.physicalAssetType?.toLowerCase().includes('casa') || data.physicalAssetType?.toLowerCase().includes('apartamento') || data.physicalAssetType?.toLowerCase().includes('imóvel')) return <Landmark size={18} className="text-primary mr-2" />;
    if (data.physicalAssetType?.toLowerCase().includes('veículo') || data.physicalAssetType?.toLowerCase().includes('carro')) return <Building size={18} className="text-primary mr-2" />; // Corrected icon for vehicle
    return <Landmark size={18} className="text-primary mr-2" />;
  }
  return <DollarSign size={18} className="text-primary mr-2" />;
};

export function AssetNode({ id: nodeId, data, selected }: NodeProps<AssetNodeData>) {
  const icon = getIconForAsset(data);
  const { toast } = useToast();

  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click if clock is clicked
    toast({
      title: 'Configurar Liberação',
      description: `Em breve: configurar liberação do ativo "${data.name}" ${data.releaseCondition?.targetAge ? `aos ${data.releaseCondition.targetAge} anos` : ''}.`,
    });
  };

  const handleCardClick = () => {
    toast({
      title: 'Histórico do Ativo',
      description: `Em breve: visualizar histórico de adições para "${data.name}".`,
    });
  };

  return (
    <Card
      className={`w-60 shadow-lg border-2 ${selected ? 'border-primary shadow-primary/50' : 'border-border'} bg-card relative rounded-lg cursor-pointer hover:shadow-md transition-shadow`}
      style={{ overflow: 'visible' }}
      onClick={handleCardClick}
    >
      <Handle type="target" position={Position.Top} id={`t-${nodeId}-top`} className="!opacity-50 !bg-ring" />
      <Handle type="source" position={Position.Top} id={`s-${nodeId}-top`} className="!opacity-50 !bg-ring !top-[-4px]" />


      <CardHeader className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center overflow-hidden">
            {icon}
            <CardTitle className="text-sm font-semibold text-card-foreground truncate" title={data.name}>
              {data.name}
            </CardTitle>
          </div>
          {data.releaseCondition?.type === 'age' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-blue-500 hover:bg-blue-500/10"
              onClick={handleClockClick}
              aria-label="Configurar condição de liberação"
            >
              <Clock size={14} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3 text-xs space-y-1">
        {data.assetMainType === 'digital' && (
          <>
            <Badge variant="secondary" className="text-xs">
              {data.digitalAssetType || 'Digital'}
            </Badge>
            {data.quantity !== undefined && (
              <Badge variant="outline" className="ml-1 text-xs">
                Qtd: {data.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
              </Badge>
            )}
          </>
        )}
        {data.assetMainType === 'fisico' && (
          <Badge variant="secondary" className="text-xs">
            {data.physicalAssetType || 'Físico'}
          </Badge>
        )}
        {data.releaseCondition?.targetAge && (
           <p className="text-muted-foreground text-xs italic mt-1">
            Libera aos: {data.releaseCondition.targetAge} anos
          </p>
        )}
      </CardContent>
      <Handle type="source" position={Position.Bottom} id={`s-${nodeId}-bottom`} className="!opacity-50 !bg-ring" />
       <Handle type="target" position={Position.Bottom} id={`t-${nodeId}-bottom`} className="!opacity-50 !bg-ring !bottom-[-4px]" />
    </Card>
  );
}

    