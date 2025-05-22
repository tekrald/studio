
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Coins, Landmark, Building, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { ExtendedAssetNodeData } from '@/app/(main)/dashboard/page'; // Importando o tipo estendido

// AssetNodeData aqui refere-se ao tipo de dados que este componente espera.
// Usaremos ExtendedAssetNodeData para garantir que temos 'transactions' e 'nomeAtivo'.
// A prop 'data' em NodeProps<AssetNodeData> será inferida como ExtendedAssetNodeData pelo React Flow.

const getIconForAsset = (data: ExtendedAssetNodeData) => {
  if (data.tipo === 'digital') {
    return <Coins size={18} className="text-primary mr-2" />;
  }
  if (data.tipo === 'fisico') {
    if (data.tipoImovelBemFisico?.toLowerCase().includes('casa') || data.tipoImovelBemFisico?.toLowerCase().includes('apartamento') || data.tipoImovelBemFisico?.toLowerCase().includes('imóvel')) return <Landmark size={18} className="text-primary mr-2" />;
    if (data.tipoImovelBemFisico?.toLowerCase().includes('veículo') || data.tipoImovelBemFisico?.toLowerCase().includes('carro')) return <Building size={18} className="text-primary mr-2" />;
    return <Landmark size={18} className="text-primary mr-2" />;
  }
  return <DollarSign size={18} className="text-primary mr-2" />;
};

export function AssetNode({ id: nodeId, data, selected }: NodeProps<ExtendedAssetNodeData>) {
  const icon = getIconForAsset(data);
  const { toast } = useToast();

  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    toast({
      title: 'Configurar Liberação',
      description: `Em breve: configurar liberação do ativo "${data.nomeAtivo}" ${data.releaseCondition?.targetAge ? `aos ${data.releaseCondition.targetAge} anos` : ''}.`,
    });
  };

  const handleCardClick = () => {
    if (data.onOpenDetails) {
      data.onOpenDetails();
    } else {
      toast({
        title: 'Detalhes do Ativo',
        description: `Visualizando detalhes de "${data.nomeAtivo}". (onOpenDetails não configurado)`,
      });
    }
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
            <CardTitle className="text-sm font-semibold text-card-foreground truncate" title={data.nomeAtivo}>
              {data.nomeAtivo}
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
        {data.tipo === 'digital' && data.quantidadeTotalDigital !== undefined && (
            <Badge variant="outline" className="text-xs">
                Qtd Total: {data.quantidadeTotalDigital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
            </Badge>
        )}
        {data.tipo === 'fisico' && data.tipoImovelBemFisico && (
          <Badge variant="secondary" className="text-xs">
            {data.tipoImovelBemFisico}
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
