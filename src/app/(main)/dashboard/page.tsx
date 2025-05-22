
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Network, DollarSign, LayoutGrid, Settings } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData } from '@/types/asset';
import { addAsset } from '@/actions/assetActions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  type: 'union' | 'asset';
  data: { label: string; details?: string };
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

const UNION_NODE_ID = 'union-node';

export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (user && !authLoading && typeof window !== 'undefined' && !nodes.find(node => node.id === UNION_NODE_ID)) {
      const unionNode: Node = {
        id: UNION_NODE_ID,
        type: 'union',
        data: { label: user.displayName || 'Nossa União' },
        position: { x: (window.innerWidth * 0.8) / 2 , y: 100 }, // Ajustado Y para dar espaço para header interna
      };
      setNodes([unionNode]);
    }
  }, [user, authLoading, nodes]);


  const handleAddAssetSubmit = async (data: AssetFormData) => {
    if (!user) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
    const result = await addAsset(data, user.uid); // Firebase está mockado em assetActions
    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });
      
      const unionNodePosition = nodes.find(n => n.id === UNION_NODE_ID)?.position || { x: (typeof window !== 'undefined' ? window.innerWidth * 0.8 : 600) / 2, y: 100 };
      const assetNodesCount = nodes.filter(n => n.type === 'asset').length;

      const newAssetNode: Node = {
        id: result.assetId,
        type: 'asset',
        data: {
          label: data.nomeAtivo,
          details: `Tipo: ${data.tipo === 'digital' ? 'Digital' : 'Físico'}, Valor: R$ ${data.valorAtualEstimado}`
        },
        position: {
          x: unionNodePosition.x + (assetNodesCount % 4 - 1.5) * 180, 
          y: unionNodePosition.y + 200 + Math.floor(assetNodesCount / 4) * 120  // Aumentado Y para mais espaço
        },
      };
      setNodes((prevNodes) => [...prevNodes, newAssetNode]);

      const newEdge: Edge = {
        id: `e-${UNION_NODE_ID}-${result.assetId}`,
        source: UNION_NODE_ID,
        target: result.assetId,
      };
      setEdges((prevEdges) => [...prevEdges, newEdge]);

      setIsAssetModalOpen(false);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o ativo.', variant: 'destructive' });
    }
    setIsSubmittingAsset(false);
  };

  const handleAddMember = () => {
    toast({ title: 'Em Breve!', description: 'Funcionalidade de adicionar membros será implementada.' });
  };
  
  const handleUnionSettingsClick = () => {
    toast({ title: 'Em Breve!', description: 'Configurações da união/contrato serão implementadas aqui.' });
  };

  if (authLoading && !user) {
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,100px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }
  
  const baseNodeClasses = "absolute rounded-lg shadow-md border transform -translate-x-1/2 -translate-y-1/2 min-w-[180px] max-w-[220px] cursor-grab";


  return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height,100px)-2rem)]">
        <Card className="mb-6 shadow-xl bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))]">
          <CardHeader className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Network className="h-10 w-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-4xl text-white font-pacifico">Holding Familiar</CardTitle>
                <CardDescription className="text-white/90 text-lg mt-1">
                  Visualize e gerencie os membros e ativos da sua família.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="mb-4 p-4 rounded-lg shadow-md bg-card flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-pacifico text-primary mr-auto md:mr-4">Ações:</h3>
            
            <Button onClick={() => setIsAssetModalOpen(true)} className="justify-start">
              <DollarSign className="mr-2 h-5 w-5" /> Adicionar Ativo
            </Button>
            <Dialog open={isAssetModalOpen} onOpenChange={setIsAssetModalOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-pacifico text-primary">Adicionar Novo Ativo</DialogTitle>
                  <DialogDescription>Preencha os detalhes do seu ativo.</DialogDescription>
                </DialogHeader>
                <AssetForm onSubmit={handleAddAssetSubmit} isLoading={isSubmittingAsset} onClose={() => setIsAssetModalOpen(false)} />
              </DialogContent>
            </Dialog>

            <Button onClick={handleAddMember} variant="outline" className="justify-start">
              <Users className="mr-2 h-5 w-5" /> Adicionar Membro
            </Button>
        </div>

        <Card className="flex-grow p-1 shadow-lg relative overflow-hidden">
            <CardHeader className="absolute top-2 left-3 z-10">
              <CardTitle className="text-lg font-pacifico text-muted-foreground">Canvas de Gestão</CardTitle>
            </CardHeader>
            <div className="w-full h-full bg-muted/30 rounded-md border-2 border-dashed border-gray-300 relative">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={cn(
                    baseNodeClasses,
                    node.type === 'union' ? 'overflow-hidden' : 'bg-card text-card-foreground p-3 text-center'
                  )}
                  style={{ left: `${node.position.x}px`, top: `${node.position.y}px` }}
                >
                  {node.type === 'union' ? (
                    <div className="flex flex-col h-full">
                      {/* Header colorida interna */}
                      <div className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] p-1.5 rounded-t-md flex justify-end items-center">
                        <button
                          onClick={handleUnionSettingsClick}
                          className="p-1 text-white/80 hover:text-white focus:outline-none focus:ring-1 focus:ring-white rounded"
                          aria-label="Configurações da União"
                        >
                          <Settings size={14} />
                        </button>
                      </div>
                      {/* Conteúdo branco interno */}
                      <div className="bg-card text-card-foreground p-3 rounded-b-md text-center flex-grow">
                        <div className="font-semibold text-sm flex items-center justify-center">
                          <Network className="w-4 h-4 inline-block mr-2 text-primary opacity-90" />
                          {node.data.label}
                        </div>
                      </div>
                    </div>
                  ) : ( // Nó do tipo asset
                    <>
                      <div className="font-semibold text-sm flex items-center justify-center">
                        <DollarSign className="w-4 h-4 inline-block mr-2 opacity-70" />
                        {node.data.label}
                      </div>
                      {node.data.details && <div className="text-xs mt-1 opacity-80">{node.data.details}</div>}
                    </>
                  )}
                </div>
              ))}
              
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {edges.map((edge) => {
                  const sourceNode = nodes.find((n) => n.id === edge.source);
                  const targetNode = nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  
                  // Ajustar para que as linhas saiam da borda inferior do nó união e superior do nó ativo
                  const sourceX = sourceNode.position.x;
                  const sourceY = sourceNode.position.y + 35; // Aproximadamente metade da altura do nó união (ajustar se necessário)
                  const targetX = targetNode.position.x;
                  const targetY = targetNode.position.y - 25; // Aproximadamente metade da altura do nó ativo

                  return (
                    <line
                      key={edge.id}
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                      markerEnd="url(#arrowhead)"
                    />
                  );
                })}
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto" markerUnits="strokeWidth">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--border))" />
                  </marker>
                </defs>
              </svg>

              {nodes.length === 0 && !authLoading && (
                 <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground">
                    <div>
                        <LayoutGrid size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl">Seu canvas de gestão familiar aparecerá aqui.</p>
                        <p className="text-sm">Use as ações acima para adicionar membros e ativos.</p>
                    </div>
                </div>
              )}
            </div>
          </Card>
      </div>
  );
}
    