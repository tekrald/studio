
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, Network, DollarSign, LayoutGrid } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData } from '@/types/asset';
import { addAsset } from '@/actions/assetActions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MarkerType,
  type Node,
  type Edge,
  type OnConnect,
  type Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

const UNION_NODE_ID = 'union-node';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    if (user && !authLoading && !nodes.find(node => node.id === UNION_NODE_ID)) {
      const unionNode: Node = {
        id: UNION_NODE_ID,
        type: 'default', // Using default node type for now
        data: { label: user.displayName || 'Nossa União' },
        position: { x: 250, y: 50 },
        draggable: true,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--primary))',
          width: 180,
          padding: '10px',
          borderRadius: 'var(--radius)',
          textAlign: 'center',
        },

      };
      setNodes([unionNode]);
    }
  }, [user, authLoading, nodes, setNodes]);


  const handleAddAssetSubmit = async (data: AssetFormData) => {
    if (!user) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
    // Firebase is currently mocked in assetActions
    const result = await addAsset(data, user.uid); 
    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });
      
      const unionNode = nodes.find(n => n.id === UNION_NODE_ID);
      const existingAssetNodesCount = nodes.filter(n => n.id !== UNION_NODE_ID).length;

      // Simple positioning logic for new asset nodes
      const newAssetNodeX = (unionNode?.position.x || 250) + (existingAssetNodesCount % 3 -1) * 200;
      const newAssetNodeY = (unionNode?.position.y || 50) + 150 + Math.floor(existingAssetNodesCount / 3) * 100;


      const newAssetNode: Node = {
        id: result.assetId,
        type: 'default',
        data: {
          label: data.nomeAtivo,
          // details: `Tipo: ${data.tipo === 'digital' ? 'Digital' : 'Físico'}, Valor: R$ ${data.valorAtualEstimado}`
        },
        position: { x: newAssetNodeX, y: newAssetNodeY },
        draggable: true,
        style: {
          background: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
          width: 150,
          padding: '10px',
          borderRadius: 'var(--radius)',
          fontSize: '0.9rem',
          textAlign: 'center',
        },
      };
      setNodes((prevNodes) => prevNodes.concat(newAssetNode));

      const newEdge: Edge = {
        id: `e-${UNION_NODE_ID}-${result.assetId}`,
        source: UNION_NODE_ID,
        target: result.assetId,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
      };
      setEdges((prevEdges) => prevEdges.concat(newEdge));

      setIsAssetModalOpen(false);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o ativo.', variant: 'destructive' });
    }
    setIsSubmittingAsset(false);
  };

  const handleAddMember = () => {
    toast({ title: 'Em Breve!', description: 'Funcionalidade de adicionar membros será implementada.' });
  };
  
  if (authLoading && !user && nodes.length === 0) { // Check nodes.length to avoid flicker if union node already exists
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,100px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    // This case should ideally be handled by the MainAppLayout redirecting to login
    return null; 
  }

  return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height,100px)-var(--actions-bar-height,76px)-4rem)]"> {/* Adjusted height */}
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

        {/* Actions Bar - approx 76px height with padding */}
        <div style={{ '--actions-bar-height': '76px' } as React.CSSProperties} className="mb-4 p-4 rounded-lg shadow-md bg-card flex flex-wrap items-center gap-3">
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

        <Card className="flex-grow shadow-lg relative overflow-hidden">
            <CardHeader className="absolute top-2 left-3 z-10 pointer-events-none">
              <CardTitle className="text-lg font-pacifico text-muted-foreground">Canvas de Gestão</CardTitle>
            </CardHeader>
            <div className="w-full h-full bg-muted/30 rounded-md border-2 border-dashed border-gray-300">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-left"
              >
                <Controls />
                <Background gap={16} />
              </ReactFlow>
              {nodes.length === 0 && !authLoading && ( // Show only if no nodes and not loading auth
                 <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground pointer-events-none">
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
