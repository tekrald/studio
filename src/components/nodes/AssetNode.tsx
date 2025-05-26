
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Landmark, BuildingIcon, Clock, Info } from 'lucide-react'; // BuildingIcon as a generic physical asset for now
import { useToast } from '@/hooks/use-toast';
import type { ExtendedAssetNodeData } from '@/types/asset';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const BitcoinIconSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><circle cx="12" cy="12" r="10" fill="#F7931A"/><path d="M10.05 16.64H12.32C14.66 16.64 16.31 15.32 16.31 12.91C16.31 10.5 14.66 9.17999 12.32 9.17999H10.05V7.35999H12.4C15.43 7.35999 17.5 8.95999 17.5 11.82C17.5 13.48 16.73 14.91 15.38 15.79V15.83C17.06 16.57 18 17.97 18 19.76C18 22.79 15.67 24.48 12.54 24.48H8V7.35999H10.05V16.64ZM10.05 11.6H12.22C13.6 11.6 14.51 12.31 14.51 13.59C14.51 14.87 13.6 15.58 12.22 15.58H10.05V11.6ZM10.05 17.68H12.4C13.98 17.68 15.03 18.46 15.03 19.79C15.03 21.12 13.98 21.9 12.4 21.9H10.05V17.68Z" fill="white" transform="scale(0.75) translate(2, -4)"/></svg>;
const EthereumIconSvg = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M12.023 2.68701L11.531 3.32701V11.56L12.023 11.829L12.516 11.56V3.32701L12.023 2.68701Z" fill="#627EEA"/><path d="M12.023 2.68701L6.78101 9.40401L12.023 11.829V2.68701Z" fill="#8AA1F2"/><path d="M12.023 2.68701L17.265 9.40401L12.023 11.829V2.68701Z" fill="#627EEA"/><path d="M12.023 12.76L11.555 12.981V16.844L12.023 17.13L12.492 16.844V12.981L12.023 12.76Z" fill="#627EEA"/><path d="M12.023 17.13V12.76L6.78101 10.352L12.023 17.13Z" fill="#8AA1F2"/><path d="M12.023 17.13V12.76L17.265 10.352L12.023 17.13Z" fill="#627EEA"/><path d="M12.023 11.829L17.265 9.40401L12.023 6.99701L6.78101 9.40401L12.023 11.829Z" fill="#45578E"/></svg>;
const UsdcIconSvg = () => ( // Simple USDC placeholder icon
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <circle cx="12" cy="12" r="10" fill="#2775CA"/>
    <path d="M12 17.5C14.7614 17.5 17 15.2614 17 12.5C17 9.73858 14.7614 7.5 12 7.5C9.23858 7.5 7 9.73858 7 12.5C7 13.8462 7.51211 15.0739 8.36341 15.9697M12 17.5C9.23858 17.5 7 15.2614 7 12.5M12 17.5V14.5M7 12.5H10M12 7.5V10.5M17 12.5H14M12.5 10H11.5L10.5 11L11.5 12L12.5 11L13.5 12L14.5 11L13.5 10H12.5Z" stroke="white" strokeWidth="1.5"/>
  </svg>
);


const getIconForAsset = (data: ExtendedAssetNodeData) => {
  if (data.tipo === 'digital') {
    const nameLower = data.nomeAtivo.toLowerCase();
    if (nameLower.includes('bitcoin') || nameLower.includes('btc')) return <BitcoinIconSvg />;
    if (nameLower.includes('ethereum') || nameLower.includes('eth')) return <EthereumIconSvg />;
    if (nameLower.includes('usdc')) return <UsdcIconSvg />; // Assuming USDC will have 'usdc' in its name
    return <Coins size={18} className="text-primary mr-2" />;
  }
  if (data.tipo === 'fisico') {
    const tipoBemLower = data.tipoImovelBemFisico?.toLowerCase() || '';
    if (tipoBemLower.includes('house') || tipoBemLower.includes('apartment') || tipoBemLower.includes('property') || tipoBemLower.includes('imóvel') || tipoBemLower.includes('casa') || tipoBemLower.includes('apartamento')) {
      return <Landmark size={18} className="text-primary mr-2" />;
    }
    if (tipoBemLower.includes('vehicle') || tipoBemLower.includes('car') || tipoBemLower.includes('veículo') || tipoBemLower.includes('carro')) {
      return <BuildingIcon size={18} className="text-primary mr-2" />;
    }
    return <Landmark size={18} className="text-primary mr-2" />;
  }
  return <Coins size={18} className="text-primary mr-2" />;
};


export function AssetNode({ id: nodeId, data, selected }: NodeProps<ExtendedAssetNodeData>) {
  const icon = getIconForAsset(data);
  const { toast } = useToast();

  const handleClockClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking the clock
    if (data.onOpenReleaseDialog) {
      data.onOpenReleaseDialog(data);
    } else {
      toast({
        title: 'Manage Release',
        description: `Release condition for asset "${data.nomeAtivo}" ${data.releaseCondition?.targetAge ? `is set to age ${data.releaseCondition.targetAge}` : 'is not set'}. Configuration UI coming soon.`,
      });
    }
  };

  const handleCardClick = () => {
    if (data.onOpenDetails) {
      data.onOpenDetails();
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        className={`w-auto min-w-[200px] max-w-[280px] shadow-lg border-2 ${selected ? 'border-primary shadow-primary/30' : 'border-border'} bg-card relative rounded-lg cursor-pointer hover:shadow-md transition-shadow`}
        style={{ overflow: 'visible' }}
        onClick={handleCardClick}
      >
        <Handle type="target" position={Position.Top} id={`t-${nodeId}-asset`} className="!opacity-50 !bg-ring" />

        <CardHeader className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center overflow-hidden">
              {icon}
              <CardTitle className="text-sm font-semibold text-card-foreground truncate" title={data.nomeAtivo}>
                {data.nomeAtivo}
              </CardTitle>
            </div>
            {data.assignedToMemberId && data.releaseCondition?.type === 'age' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-accent hover:bg-accent/10"
                onClick={handleClockClick}
                aria-label="Manage release condition"
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
        <Handle type="source" position={Position.Bottom} id={`s-${nodeId}-asset`} className="!opacity-50 !bg-ring" />
      </Card>
    </TooltipProvider>
  );
}
