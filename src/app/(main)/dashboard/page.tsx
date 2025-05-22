
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LayoutGrid, Settings, PlusCircle } from 'lucide-react'; 
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData, DigitalAsset, PhysicalAsset } from '@/types/asset';
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
import { AssetNode, type AssetNodeData } from '@/components/nodes/AssetNode';
import { MemberNode, type MemberNodeData } from '@/components/nodes/MemberNode';
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog';

const UNION_NODE_ID = 'union-node';
const nodeOrigin: NodeOrigin = [0.5, 0.5];

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  unionNode: UnionNode,
  assetNode: AssetNode,
  memberNode: MemberNode,
};

// Combined Node Data type for React Flow
type CustomNodeData = UnionNodeData | AssetNodeData | MemberNodeData;


export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth(); 
  const { toast } = useToast();
  
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodes);
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
  
  const handleRemoveClause = (id: string) => {
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
  
  const effectiveUser = user || { uid: 'mock-uid-default', displayName: 'Nossa União (Mock)'};


  useEffect(() => {
    const currentUnionNode = nodes.find(node => node.id === UNION_NODE_ID);
    if (!currentUnionNode && !authLoading && user?.displayName) { 
        const unionNode: Node<UnionNodeData> = {
            id: UNION_NODE_ID,
            type: 'unionNode', 
            position: { x: 400, y: 100 },
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
  }, [ nodes, setNodes, handleOpenContractSettings, handleOpenAssetModal, handleOpenAddMemberModal, authLoading, user]);


  const handleAddAssetSubmit = async (data: AssetFormData) => {
    if (!effectiveUser) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
    const result = await addAsset(data, effectiveUser.uid); 
    
    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });
      
      const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID);
      if (!unionNodeInstance) {
        console.error("Nó da união não encontrado para adicionar o ativo.");
        setIsSubmittingAsset(false);
        return;
      }

      let assetNodeExists = false;
      // Consolidation logic for digital assets
      if (data.tipo === 'digital' && data.nomeAtivo && data.tipoAtivoDigital && data.quantidadeDigital !== undefined) {
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            if (
              node.type === 'assetNode' && // Check for custom asset node type
              (node.data as AssetNodeData).assetMainType === 'digital' &&
              (node.data as AssetNodeData).name === data.nomeAtivo &&
              (node.data as AssetNodeData).digitalAssetType === data.tipoAtivoDigital 
            ) {
              assetNodeExists = true;
              const existingData = node.data as AssetNodeData;
              const newQuantity = (existingData.quantity || 0) + (data.quantidadeDigital || 0);
              return {
                ...node,
                data: {
                  ...existingData,
                  quantity: newQuantity,
                },
              };
            }
            return node;
          })
        );
      }

      if (!assetNodeExists) {
        const assetNodesCount = nodes.filter(n => n.type === 'assetNode').length;
        const angleStep = Math.PI / 4; 
        const radius = 250 + Math.floor(assetNodesCount / 6) * 100; // Increased radius spread
        
        const unionNodeX = unionNodeInstance.position?.x ?? 400;
        const unionNodeY = unionNodeInstance.position?.y ?? 100;
        const angle = (assetNodesCount * angleStep) + (Math.PI / 8); 

        const newAssetNodeX = unionNodeX + radius * Math.cos(angle);
        const newAssetNodeY = unionNodeY + (unionNodeInstance.height ?? 150) + 50 + radius * Math.sin(angle);
        
        let nodeDataPayload: AssetNodeData;

        if (data.tipo === 'digital') {
          nodeDataPayload = {
            name: data.nomeAtivo,
            assetMainType: 'digital',
            digitalAssetType: data.tipoAtivoDigital,
            quantity: data.quantidadeDigital || 0,
          };
        } else { // fisico
           nodeDataPayload = {
            name: data.nomeAtivo,
            assetMainType: 'fisico',
            physicalAssetType: data.tipoImovelBemFisico
          };
        }

        const newAssetNode: Node<AssetNodeData> = {
          id: result.assetId,
          type: 'assetNode', // Use custom asset node type
          data: nodeDataPayload,
          position: { x: newAssetNodeX, y: newAssetNodeY },
          draggable: true,
          nodeOrigin,
        };
        setNodes((prevNodes) => prevNodes.concat(newAssetNode));

        const newEdge: Edge = {
          id: `e-${UNION_NODE_ID}-${result.assetId}`,
          source: UNION_NODE_ID,
          target: result.assetId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
        };
        setEdges((prevEdges) => prevEdges.concat(newEdge));
      }
      setIsAssetModalOpen(false);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o ativo.', variant: 'destructive' });
    }
    setIsSubmittingAsset(false);
  };

  const handleAddMemberSubmit = async (data: MemberFormData) => {
    if (!effectiveUser) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingMember(true);
    const result = await addMember(data, UNION_NODE_ID); 
    if (result.success && result.memberId) {
      toast({ title: 'Sucesso!', description: 'Membro adicionado com sucesso.' });

      const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID);
      if (!unionNodeInstance) {
        setIsSubmittingMember(false);
        return;
      }

      const memberNodesCount = nodes.filter(n => n.type === 'memberNode').length;
      const angleStep = Math.PI / 4; 
      const radius = 250 + Math.floor(memberNodesCount / 6) * 100; // Increased radius spread
      
      const unionNodeX = unionNodeInstance.position?.x ?? 400;
      const unionNodeY = unionNodeInstance.position?.y ?? 100;
      const angle = (memberNodesCount * angleStep) + (Math.PI * 5/8); 

      const newMemberNodeX = unionNodeX + radius * Math.cos(angle);
      const newMemberNodeY = unionNodeY + (unionNodeInstance.height ?? 150) + 50 + radius * Math.sin(angle);

      const nodeDataPayload: MemberNodeData = {
        name: data.nome,
        relationshipType: data.tipoRelacao,
      };

      const newMemberNode: Node<MemberNodeData> = {
        id: result.memberId,
        type: 'memberNode', // Use custom member node type
        data: nodeDataPayload,
        position: { x: newMemberNodeX, y: newMemberNodeY },
        draggable: true,
        nodeOrigin,
      };
      setNodes((prevNodes) => prevNodes.concat(newMemberNode));

      const newEdge: Edge = {
        id: `e-${UNION_NODE_ID}-${result.memberId}`,
        source: UNION_NODE_ID,
        target: result.memberId,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--accent))' },
        style: { stroke: 'hsl(var(--accent))', strokeWidth: 1.5 },
      };
      setEdges((prevEdges) => prevEdges.concat(newEdge));

      setIsAddMemberModalOpen(false);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o membro.', variant: 'destructive' });
    }
    setIsSubmittingMember(false);
  };
  
  if (authLoading && nodes.length === 0) { 
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,60px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height,60px)-2rem)]"> {/* Adjusted height calculation */}
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
            onRemoveClause={handleRemoveClause}
            onUpdateClause={handleUpdateContractClause}
          />
        
        <div className="flex-grow shadow-lg relative overflow-hidden rounded-md border-2 border-dashed border-border bg-muted/30">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes} 
            fitView
            fitViewOptions={{ padding: 0.3 }} // Increased padding slightly
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
            nodeOrigin={nodeOrigin}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Controls />
            <Background gap={16} color="hsl(var(--border))" />
          </ReactFlow>
        </div>
      </div>
  );
}

// Extend NodeData type for ReactFlow
declare module 'reactflow' {
    interface NodeData extends Partial<UnionNodeData>, Partial<AssetNodeData>, Partial<MemberNodeData> {}
}
