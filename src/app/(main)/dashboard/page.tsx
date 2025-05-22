
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Network, DollarSign, Users, LayoutGrid, Settings, Plus } from 'lucide-react';
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
  Position,
  type Node,
  type Edge,
  type OnConnect,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UnionNode, type UnionNodeData } from '@/components/nodes/UnionNode';


const UNION_NODE_ID = 'union-node';

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  unionNode: UnionNode,
};

export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<UnionNodeData | { label: string }>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' } }, eds)),
    [setEdges]
  );
  
  const handleUnionSettingsClick = useCallback(() => {
    toast({ title: 'Em Breve!', description: 'Configurações da união/contrato serão implementadas aqui.' });
  }, [toast]);

  const handleOpenAssetModal = useCallback(() => {
    setIsAssetModalOpen(true);
  }, []);
  
  const handleAddMemberDashboard = useCallback(() => {
    toast({ title: 'Em Breve!', description: 'Funcionalidade de adicionar membros será implementada.' });
  }, [toast]);


  useEffect(() => {
    if (user && !authLoading && !nodes.find(node => node.id === UNION_NODE_ID)) {
      const unionNode: Node<UnionNodeData> = {
        id: UNION_NODE_ID,
        type: 'unionNode', // Custom type
        position: { x: 250, y: 50 },
        data: { 
          label: user.displayName || 'Nossa União',
          onSettingsClick: handleUnionSettingsClick,
          onOpenAssetModal: handleOpenAssetModal,
          onAddMember: handleAddMemberDashboard,
        },
        draggable: true,
      };
      setNodes([unionNode]);
    }
  }, [user, authLoading, nodes, setNodes, handleUnionSettingsClick, handleOpenAssetModal, handleAddMemberDashboard]);


  const handleAddAssetSubmit = async (data: AssetFormData) => {
    if (!user) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
    const result = await addAsset(data, user.uid); 
    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });
      
      const unionNode = nodes.find(n => n.id === UNION_NODE_ID);
      const existingAssetNodesCount = nodes.filter(n => n.id !== UNION_NODE_ID).length;

      const newAssetNodeX = (unionNode?.position.x || 250) + (existingAssetNodesCount % 4 - 1.5) * 200;
      const newAssetNodeY = (unionNode?.position.y || 50) + 250 + Math.floor(existingAssetNodesCount / 4) * 120;


      const newAssetNode: Node = {
        id: result.assetId,
        type: 'default',
        data: {
          label: data.nomeAtivo,
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
        type: 'smoothstep',
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
  
  if (authLoading && !user && nodes.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,100px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return null; 
  }

  return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height,100px)-var(--actions-bar-height,76px)-4rem)]">
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

        {/* Actions Bar (mantida caso precisemos de outras ações globais) */}
        <div style={{ '--actions-bar-height': '76px' } as React.CSSProperties} className="mb-4 p-4 rounded-lg shadow-md bg-card flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-pacifico text-primary mr-auto md:mr-4">Ações do Canvas:</h3>
             <p className="text-sm text-muted-foreground">Use o <Plus size={16} className="inline text-primary"/> no nó da Holding para adicionar itens.</p>
            {/* Botões "Adicionar Ativo" e "Adicionar Membro" foram removidos daqui */}
        </div>
         <Dialog open={isAssetModalOpen} onOpenChange={setIsAssetModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-pacifico text-primary">Adicionar Novo Ativo</DialogTitle>
                <DialogDescription>Preencha os detalhes do seu ativo.</DialogDescription>
              </DialogHeader>
              <AssetForm onSubmit={handleAddAssetSubmit} isLoading={isSubmittingAsset} onClose={() => setIsAssetModalOpen(false)} />
            </DialogContent>
          </Dialog>

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
                nodeTypes={nodeTypes} // Register custom node types
                fitView
                attributionPosition="bottom-left"
                proOptions={{ hideAttribution: true }}
              >
                <Controls />
                <Background gap={16} />
              </ReactFlow>
              {nodes.length === 0 && !authLoading && (
                 <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground pointer-events-none">
                    <div>
                        <LayoutGrid size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl">Seu canvas de gestão familiar aparecerá aqui.</p>
                        <p className="text-sm">O nó da sua Holding Familiar será criado automaticamente.</p>
                    </div>
                </div>
              )}
            </div>
          </Card>
      </div>
  );
}

