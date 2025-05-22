
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardContent e CardHeader não são mais usados diretamente aqui, mas podem ser por ReactFlow
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Users, LayoutGrid, Settings, DollarSign } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData } from '@/types/asset';
import { addAsset } from '@/actions/assetActions';
import { AddMemberForm } from '@/components/members/AddMemberForm';
import type { MemberFormData } from '@/types/member';
import { addMember } from '@/actions/memberActions';

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
  NodeOrigin,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { UnionNode, type UnionNodeData } from '@/components/nodes/UnionNode';
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog';


const UNION_NODE_ID = 'union-node';
const nodeOrigin: NodeOrigin = [0.5, 0.5];

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
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<UnionNodeData | { label: string; tipoRelacao?: string }>(initialNodes);
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
  
  const handleUpdateContractClause = (id: string, newText: string) => {
    setContractClauses(prev => prev.map(clause => clause.id === id ? { ...clause, text: newText } : clause));
    toast({ title: 'Cláusula Atualizada', description: 'A cláusula foi modificada com sucesso.' });
  };

  const handleOpenAssetModal = useCallback(() => {
    setIsAssetModalOpen(true);
  }, []);

  const handleOpenAddMemberModal = useCallback(() => {
    setIsAddMemberModalOpen(true);
  }, []);
  

  useEffect(() => {
    if (user && !authLoading && !nodes.find(node => node.id === UNION_NODE_ID)) {
      const unionNode: Node<UnionNodeData> = {
        id: UNION_NODE_ID,
        type: 'unionNode', 
        position: { x: 250, y: 50 },
        data: { 
          label: user.displayName || 'Nossa União',
          onSettingsClick: handleOpenContractSettings,
          onOpenAssetModal: handleOpenAssetModal,
          onAddMember: handleOpenAddMemberModal,
        },
        draggable: true,
        nodeOrigin,
      };
      setNodes([unionNode]);
    }
  }, [user, authLoading, nodes, setNodes, handleOpenContractSettings, handleOpenAssetModal, handleOpenAddMemberModal]);


  const handleAddAssetSubmit = async (data: AssetFormData) => {
    if (!user) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
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
      
      const assetNodes = nodes.filter(n => n.type !== 'unionNode' && !n.data?.tipoRelacao); 
      const existingAssetNodesCount = assetNodes.length;

      const angle = (existingAssetNodesCount * Math.PI) / (nodes.length > 5 ? 4 : 3); 
      const radius = 200 + Math.floor(existingAssetNodesCount / (nodes.length > 5 ? 8 : 6)) * 60;
      
      const unionNodeX = unionNodeInstance.position?.x ?? 250;
      const unionNodeY = unionNodeInstance.position?.y ?? 50;

      const newAssetNodeX = unionNodeX + radius * Math.cos(angle);
      const newAssetNodeY = unionNodeY + (unionNodeInstance.height ?? 100) / 2 + 50 + radius * Math.sin(angle);


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
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
        nodeOrigin,
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

  const handleAddMemberSubmit = async (data: MemberFormData) => {
    if (!user) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingMember(true);
    const result = await addMember(data, UNION_NODE_ID); 
    if (result.success && result.memberId) {
      toast({ title: 'Sucesso!', description: 'Membro adicionado com sucesso.' });

      const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID);
      if (!unionNodeInstance) {
        console.error("Nó da união não encontrado para adicionar o membro.");
        toast({ title: 'Erro Interno', description: 'Nó da união não encontrado.', variant: 'destructive' });
        setIsSubmittingMember(false);
        return;
      }

      const memberNodes = nodes.filter(n => n.data?.tipoRelacao); 
      const existingMemberNodesCount = memberNodes.length;
      
      const angle = (existingMemberNodesCount * Math.PI) / (nodes.length > 5 ? 4 : 3) + Math.PI; 
      const radius = 180 + Math.floor(existingMemberNodesCount / (nodes.length > 5 ? 8 : 6)) * 50;
      
      const unionNodeX = unionNodeInstance.position?.x ?? 250;
      const unionNodeY = unionNodeInstance.position?.y ?? 50;

      const newMemberNodeX = unionNodeX + radius * Math.cos(angle);
      const newMemberNodeY = unionNodeY + (unionNodeInstance.height ?? 100) / 2 + 50 + radius * Math.sin(angle);

      const newMemberNode: Node = {
        id: result.memberId,
        type: 'default',
        data: {
          label: `${data.nome} (${data.tipoRelacao})`, 
          tipoRelacao: data.tipoRelacao, 
        },
        position: { x: newMemberNodeX, y: newMemberNodeY },
        draggable: true,
        style: {
          background: 'hsl(var(--accent))', 
          color: 'hsl(var(--accent-foreground))',
          border: '1px solid hsl(var(--ring))',
          width: 160,
          padding: '10px',
          borderRadius: 'var(--radius)',
          fontSize: '0.9rem',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        sourcePosition: Position.Top,
        targetPosition: Position.Bottom,
        nodeOrigin,
      };
      setNodes((prevNodes) => prevNodes.concat(newMemberNode));

      const newEdge: Edge = {
        id: `e-${UNION_NODE_ID}-${result.memberId}`,
        source: UNION_NODE_ID,
        target: result.memberId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--accent))' },
        style: { stroke: 'hsl(var(--accent))', strokeWidth: 2 },
      };
      setEdges((prevEdges) => prevEdges.concat(newEdge));

      setIsAddMemberModalOpen(false);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o membro.', variant: 'destructive' });
    }
    setIsSubmittingMember(false);
  };
  
  if (authLoading && !user && nodes.length === 0) { // Condição original mantida, pode ajustar se user for sempre null
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,100px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height,100px)-2rem)]"> {/* Ajustar padding-top se necessário */}
         <Dialog open={isAssetModalOpen} onOpenChange={setIsAssetModalOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">Adicionar Novo Ativo</DialogTitle>
                <DialogDescription>Preencha os detalhes do seu ativo.</DialogDescription>
              </DialogHeader>
              <AssetForm onSubmit={handleAddAssetSubmit} isLoading={isSubmittingAsset} onClose={() => setIsAssetModalOpen(false)} />
            </DialogContent>
          </Dialog>

          <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">Adicionar Novo Membro</DialogTitle>
                <DialogDescription>Insira os dados do novo membro da família.</DialogDescription>
              </DialogHeader>
              <AddMemberForm onSubmit={handleAddMemberSubmit} isLoading={isSubmittingMember} onClose={() => setIsAddMemberModalOpen(false)} />
            </DialogContent>
          </Dialog>

          <ContractSettingsDialog
            isOpen={isContractSettingsModalOpen}
            onClose={() => setIsContractSettingsModalOpen(false)}
            clauses={contractClauses}
            onAddClause={handleAddContractClause}
            onRemoveClause={handleRemoveContractClause}
            onUpdateClause={handleUpdateContractClause}
          />

        <Card className="flex-grow shadow-lg relative overflow-hidden">
            {/* CardHeader para "Canvas de Gestão" foi removido para dar mais espaço ao canvas */}
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
                nodeOrigin={nodeOrigin}
              >
                <Controls />
                <Background gap={16} />
              </ReactFlow>
              {nodes.length === 0 && !authLoading && (
                 <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground pointer-events-none">
                    <div>
                        <LayoutGrid size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl">Seu canvas de gestão familiar aparecerá aqui.</p>
                        <p className="text-sm">O nó da sua Holding será criado automaticamente.</p>
                    </div>
                </div>
              )}
            </div>
          </Card>
      </div>
  );
}

