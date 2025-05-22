
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Network, DollarSign, Users, LayoutGrid, Settings, Plus } from 'lucide-react'; // Removido FileText
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
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog';


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

  const [isContractSettingsModalOpen, setIsContractSettingsModalOpen] = useState(false);
  const [contractClauses, setContractClauses] = useState<ContractClause[]>([
    { id: 'initial-1', text: 'Todos os bens adquiridos durante a união serão divididos igualmente (50/50) em caso de separação.' },
    { id: 'initial-2', text: 'As despesas ordinárias do lar serão custeadas por ambos os cônjuges, na proporção de seus respectivos rendimentos.' },
  ]);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' } }, eds)),
    [setEdges]
  );
  
  const handleOpenContractSettings = useCallback(() => {
    setIsContractSettingsModalOpen(true);
  }, []);

  const handleAddContractClause = (text: string) => {
    const newClause: ContractClause = {
      id: `clause-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text,
    };
    setContractClauses(prev => [...prev, newClause]);
    toast({ title: 'Cláusula Adicionada', description: 'Nova cláusula salva no contrato.' });
  };

  const handleRemoveContractClause = (id: string) => {
    setContractClauses(prev => prev.filter(clause => clause.id !== id));
    toast({ title: 'Cláusula Removida', description: 'A cláusula foi removida do contrato.' });
  };

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
        type: 'unionNode', 
        position: { x: 250, y: 50 }, // Ajuste a posição inicial conforme necessário
        data: { 
          label: user.displayName || 'Nossa União',
          onSettingsClick: handleOpenContractSettings,
          onOpenAssetModal: handleOpenAssetModal,
          onAddMember: handleAddMemberDashboard,
        },
        draggable: true,
      };
      setNodes([unionNode]);
    }
  }, [user, authLoading, nodes, setNodes, handleOpenContractSettings, handleOpenAssetModal, handleAddMemberDashboard]);


  const handleAddAssetSubmit = async (data: AssetFormData) => {
    if (!user) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
    // Simulação da chamada, pois o Firebase foi desabilitado temporariamente
    const result = await addAsset(data, user.uid); 
    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });
      
      const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID);
      if (!unionNodeInstance) {
        console.error("Nó da união não encontrado para adicionar o ativo.");
        toast({ title: 'Erro Interno', description: 'Nó da união não encontrado.', variant: 'destructive' });
        setIsSubmittingAsset(false);
        return;
      }
      const existingAssetNodesCount = nodes.filter(n => n.id !== UNION_NODE_ID).length;

      const angle = (existingAssetNodesCount * Math.PI) / 6; 
      const radius = 200 + Math.floor(existingAssetNodesCount / 6) * 50; 
      
      const unionNodeX = unionNodeInstance.position?.x ?? (unionNodeInstance.width ? unionNodeInstance.position?.x + unionNodeInstance.width / 2 : 250);
      const unionNodeY = unionNodeInstance.position?.y ?? (unionNodeInstance.height ? unionNodeInstance.position?.y + unionNodeInstance.height / 2 : 50);


      const newAssetNodeX = unionNodeX + radius * Math.cos(angle);
      const newAssetNodeY = unionNodeY + 150 + radius * Math.sin(angle);


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
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
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

        <div style={{ '--actions-bar-height': '76px' } as React.CSSProperties} className="mb-4 p-4 rounded-lg shadow-md bg-card flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-pacifico text-primary mr-auto md:mr-4">Ações do Canvas:</h3>
             <p className="text-sm text-muted-foreground">Use o <Plus size={16} className="inline text-primary"/> no nó da Holding para adicionar itens.</p>
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

          <ContractSettingsDialog
            isOpen={isContractSettingsModalOpen}
            onClose={() => setIsContractSettingsModalOpen(false)}
            clauses={contractClauses}
            onAddClause={handleAddContractClause}
            onRemoveClause={handleRemoveContractClause}
          />

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
                nodeTypes={nodeTypes} 
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
