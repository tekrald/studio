
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Coins, Landmark, BuildingIcon, Clock, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AssetTransaction, ExtendedAssetNodeData } from '@/types/asset'; // Ensure ExtendedAssetNodeData is imported
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BitcoinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <circle cx="12" cy="12" r="10" fill="#F7931A"/>
    <path d="M10.05 16.64H12.32C14.66 16.64 16.31 15.32 16.31 12.91C16.31 10.5 14.66 9.17999 12.32 9.17999H10.05V7.35999H12.4C15.43 7.35999 17.5 8.95999 17.5 11.82C17.5 13.48 16.73 14.91 15.38 15.79V15.83C17.06 16.57 18 17.97 18 19.76C18 22.79 15.67 24.48 12.54 24.48H8V7.35999H10.05V16.64ZM10.05 11.6H12.22C13.6 11.6 14.51 12.31 14.51 13.59C14.51 14.87 13.6 15.58 12.22 15.58H10.05V11.6ZM10.05 17.68H12.4C13.98 17.68 15.03 18.46 15.03 19.79C15.03 21.12 13.98 21.9 12.4 21.9H10.05V17.68Z" fill="white" transform="scale(0.75) translate(2, -4)"/>
  </svg>
);

const EthereumIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <path d="M12.023 2.68701L11.531 3.32701V11.56L12.023 11.829L12.516 11.56V3.32701L12.023 2.68701Z" fill="#627EEA"/>
    <path d="M12.023 2.68701L6.78101 9.40401L12.023 11.829V2.68701Z" fill="#8AA1F2"/>
    <path d="M12.023 2.68701L17.265 9.40401L12.023 11.829V2.68701Z" fill="#627EEA"/>
    <path d="M12.023 12.76L11.555 12.981V16.844L12.023 17.13L12.492 16.844V12.981L12.023 12.76Z" fill="#627EEA"/>
    <path d="M12.023 17.13V12.76L6.78101 10.352L12.023 17.13Z" fill="#8AA1F2"/>
    <path d="M12.023 17.13V12.76L17.265 10.352L12.023 17.13Z" fill="#627EEA"/>
    <path d="M12.023 11.829L17.265 9.40401L12.023 6.99701L6.78101 9.40401L12.023 11.829Z" fill="#45578E"/>
  </svg>
);

const SolanaIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <defs>
      <linearGradient id="solanaGradientNodeAsset" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: "#9945FF"}} />
        <stop offset="100%" style={{stopColor: "#14F195"}} />
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#solanaGradientNodeAsset)"/>
    <path d="M8.06006 6.5L6.5 8.06006L10.44 12L6.5 15.94L8.06006 17.5L12 13.56L15.94 17.5L17.5 15.94L13.56 12L17.5 8.06006L15.94 6.5L12 10.44L8.06006 6.5Z" fill="black" transform="scale(0.8) translate(3,3)"/>
  </svg>
);


const getIconForAsset = (data: ExtendedAssetNodeData) => {
  if (data.tipo === 'digital') {
    const nameLower = data.nomeAtivo.toLowerCase();
    if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return <BitcoinIcon />;
    if (nameLower.includes('ethereum') || nameLower.includes('eth')) return <EthereumIcon />;
    if (nameLower.includes('solana') || nameLower.includes('sol')) return <SolanaIcon />;
    if (nameLower.includes('usdc')) return <Coins size={18} className="text-green-400 mr-2" />;
    return <Coins size={18} className="text-primary mr-2" />;
  }
  if (data.tipo === 'fisico') {
    const tipoBemLower = data.tipoImovelBemFisico?.toLowerCase() || '';
    if (tipoBemLower.includes('house') || tipoBemLower.includes('apartment') || tipoBemLower.includes('property')) {
      return <Landmark size={18} className="text-primary mr-2" />;
    }
    if (tipoBemLower.includes('vehicle') || tipoBemLower.includes('car')) {
      return <BuildingIcon size={18} className="text-primary mr-2" />; // Using BuildingIcon as a generic vehicle icon
    }
    return <Landmark size={18} className="text-primary mr-2" />;
  }
  return <DollarSign size={18} className="text-primary mr-2" />;
};


export function AssetNode({ id: nodeId, data, selected }: NodeProps<ExtendedAssetNodeData>) {
  const icon = getIconForAsset(data);
  const { toast } = useToast();

  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the clock
    toast({
      title: 'Configure Release',
      description: `Coming soon: configure release for asset "${data.nomeAtivo}" ${data.releaseCondition?.targetAge ? `at age ${data.releaseCondition.targetAge}` : ''}.`,
    });
  };

  const handleCardClick = () => {
    if (data.onOpenDetails) {
      data.onOpenDetails();
    } else {
      // Fallback if onOpenDetails is not provided, though it should be
      toast({
        title: 'Asset Details',
        description: `Viewing details for "${data.nomeAtivo}". History: ${data.transactions?.length || 0} transactions.`,
      });
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        className={`w-auto min-w-[200px] max-w-[280px] shadow-lg border-2 ${selected ? 'border-primary shadow-primary/30' : 'border-border'} bg-card relative rounded-lg cursor-pointer hover:shadow-md transition-shadow`}
        style={{ overflow: 'visible' }}
        onClick={handleCardClick}
      >
        <Handle type="target" position={Position.Top} id={`t-${nodeId}`} className="!opacity-50 !bg-ring" />

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
                className="h-6 w-6 text-accent hover:bg-accent/10"
                onClick={handleClockClick}
                aria-label="Configure release condition"
              >
                <Clock size={14} />
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-3 text-xs space-y-1">
          {data.tipo === 'digital' && data.quantidadeTotalDigital !== undefined && (
              <Badge variant="outline" className="text-xs whitespace-normal text-left border-primary/50 text-primary bg-card">
                  Total Qty: {data.quantidadeTotalDigital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
              </Badge>
          )}
          {data.tipo === 'fisico' && data.tipoImovelBemFisico && (
            <Badge variant="secondary" className="text-xs whitespace-normal text-left bg-secondary/80 text-secondary-foreground">
              {data.tipoImovelBemFisico}
            </Badge>
          )}
          {data.releaseCondition?.targetAge && (
             <p className="text-muted-foreground text-[0.7rem] italic mt-1">
              Releases at: {data.releaseCondition.targetAge} yrs
            </p>
          )}
          {data.isAutoLoaded && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1 text-xs text-accent mt-1 cursor-default">
                  <Info size={13} />
                  <span>Wallet Information</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-popover text-popover-foreground text-xs p-2">
                <p>Loaded from connected wallet (simulated).</p>
              </TooltipContent>
            </Tooltip>
          )}
        </CardContent>
        <Handle type="source" position={Position.Bottom} id={`s-${nodeId}`} className="!opacity-50 !bg-ring" />
      </Card>
    </TooltipProvider>
  );
}
