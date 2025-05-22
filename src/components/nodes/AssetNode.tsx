
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Coins, Landmark, Building } from 'lucide-react'; // Added more icons

export type AssetNodeData = {
  name: string;
  assetMainType: 'digital' | 'fisico';
  // Digital asset specific
  digitalAssetType?: string; // e.g., 'cripto', 'nft', 'outro'
  quantity?: number;
  // Physical asset specific
  physicalAssetType?: string; // e.g., 'Casa', 'Carro'
};

const getIconForAsset = (data: AssetNodeData) => {
  if (data.assetMainType === 'digital') {
    if (data.digitalAssetType?.toLowerCase().includes('cripto')) return <Coins size={18} className="text-primary mr-2" />;
    if (data.digitalAssetType?.toLowerCase().includes('nft')) return <DollarSign size={18} className="text-primary mr-2" />; // Placeholder icon for NFT
    return <Coins size={18} className="text-primary mr-2" />; // Default for digital
  }
  if (data.assetMainType === 'fisico') {
    if (data.physicalAssetType?.toLowerCase().includes('casa') || data.physicalAssetType?.toLowerCase().includes('apartamento') || data.physicalAssetType?.toLowerCase().includes('imóvel')) return <Landmark size={18} className="text-primary mr-2" />;
    if (data.physicalAssetType?.toLowerCase().includes('veículo') || data.physicalAssetType?.toLowerCase().includes('carro')) return <Building size={18} className="text-primary mr-2" />; // Placeholder, could be Car icon
    return <Landmark size={18} className="text-primary mr-2" />; // Default for physical
  }
  return <DollarSign size={18} className="text-primary mr-2" />;
};

export function AssetNode({ id, data, selected }: NodeProps<AssetNodeData>) {
  const icon = getIconForAsset(data);

  return (
    <Card 
      className={`w-56 shadow-lg border-2 ${selected ? 'border-primary shadow-primary/50' : 'border-border'} bg-card relative rounded-lg`}
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
        {data.assetMainType === 'digital' && (
          <div className="space-y-1">
            <Badge variant="secondary" className="text-xs">
              {data.digitalAssetType || 'Digital'}
            </Badge>
            {data.quantity !== undefined && (
               <Badge variant="outline" className="ml-1 text-xs">
                Qtd: {data.quantity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
              </Badge>
            )}
          </div>
        )}
        {data.assetMainType === 'fisico' && (
          <Badge variant="secondary" className="text-xs">
            {data.physicalAssetType || 'Físico'}
          </Badge>
        )}
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="!opacity-50 !bg-ring" />
    </Card>
  );
}
