
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PlusCircle, Users, Briefcase, Settings, LayoutGrid, Plus, Network } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData } from '@/types/asset';
import { addAsset } from '@/actions/assetActions';
import { AddMemberForm } from '@/components/members/AddMemberForm';
import type { MemberFormData, Member } from '@/types/member';
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

export type CustomNodeData = UnionNodeData | AssetNodeData | MemberNodeData;

interface MemberWithBirthDate extends Member {
  birthDate?: Date | string;
}

export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [memberContextForAssetAdd, setMemberContextForAssetAdd] = useState<string | null>(null);


  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [allMembers, setAllMembers] = useState<MemberWithBirthDate[]>([]);


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
    setMemberContextForAssetAdd(null); // Clear context when adding asset to union
    setIsAssetModalOpen(true);
  }, []);

  const handleOpenAssetModalForMember = useCallback((memberId: string) => {
    setMemberContextForAssetAdd(memberId);
    setIsAssetModalOpen(true);
  }, []);


  const handleOpenAddMemberModal = useCallback(() => {
    setIsAddMemberModalOpen(true);
  }, []);

  const effectiveUser = user || { 
    uid: 'mock-uid-default', 
    displayName: 'Nossa União (Mock)',
    email: 'mock@example.com',
    holdingType: '',
    relationshipStructure: '',
    religion: '',
  };
  

  useEffect(() => {
    const currentUnionNode = nodes.find(node => node.id === UNION_NODE_ID);
    if (!currentUnionNode && !authLoading && effectiveUser?.displayName) {
      const unionNode: Node<UnionNodeData> = {
        id: UNION_NODE_ID,
        type: 'unionNode',
        position: { x: 400, y: 100 },
        data: {
          label: effectiveUser.displayName || 'Nossa União',
          onSettingsClick: handleOpenContractSettings,
          onOpenAssetModal: handleOpenAssetModal,
          onAddMember: handleOpenAddMemberModal,
        },
        draggable: true,
        nodeOrigin,
      };
      setNodes([unionNode]);
    } else if (currentUnionNode && effectiveUser?.displayName && currentUnionNode.data.label !== effectiveUser.displayName) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === UNION_NODE_ID
            ? { ...node, data: { ...node.data, label: effectiveUser.displayName! } }
            : node
        )
      );
    }
  }, [nodes, setNodes, handleOpenContractSettings, handleOpenAssetModal, handleOpenAddMemberModal, authLoading, effectiveUser]);

  const handleAddAssetSubmit = async (formData: AssetFormData) => { // formData param renamed from data
    if (!effectiveUser) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
    const result = await addAsset(formData, effectiveUser.uid);

    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });

      let assetNodeExists = false;
      const processedAssignedToMemberId = formData.assignedToMemberId === "UNASSIGNED" ? undefined : formData.assignedToMemberId;

      if (formData.tipo === 'digital' && formData.nomeAtivo && formData.tipoAtivoDigital && formData.quantidadeDigital !== undefined) {
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            if (
              node.type === 'assetNode' &&
              (node.data as AssetNodeData).assetMainType === 'digital' &&
              (node.data as AssetNodeData).name === formData.nomeAtivo &&
              (node.data as AssetNodeData).digitalAssetType === formData.tipoAtivoDigital &&
              (node.data as AssetNodeData).assignedToMemberId === processedAssignedToMemberId
            ) {
              assetNodeExists = true;
              const existingData = node.data as AssetNodeData;
              const newQuantity = (existingData.quantity || 0) + (formData.quantidadeDigital || 0);
              return {
                ...node,
                data: { ...existingData, quantity: newQuantity },
              };
            }
            return node;
          })
        );
      }

      if (!assetNodeExists) {
        const sourceNodeId = processedAssignedToMemberId || UNION_NODE_ID;
        const sourceNodeInstance = nodes.find(n => n.id === sourceNodeId);

        if (!sourceNodeInstance) {
          console.error("Nó de origem (União ou Membro) não encontrado para adicionar o ativo.", sourceNodeId, processedAssignedToMemberId);
          setIsSubmittingAsset(false);
          setMemberContextForAssetAdd(null);
          return;
        }
        
        const assetNodesLinkedToSource = nodes.filter(n => {
            if (n.type !== 'assetNode') return false;
            const nodeData = n.data as AssetNodeData;
            // Check if the asset is linked to the current sourceNodeId
            // It's linked if its assignedToMemberId matches sourceNodeId
            // OR if sourceNodeId is the UNION_NODE_ID and the asset is not assigned to any member
            return nodeData.assignedToMemberId === sourceNodeId || 
                   (sourceNodeId === UNION_NODE_ID && !nodeData.assignedToMemberId);
        }).length;


        const angleStep = sourceNodeId === UNION_NODE_ID ? Math.PI / 4 : Math.PI / 3; 
        const radius = sourceNodeId === UNION_NODE_ID ? 250 + Math.floor(assetNodesLinkedToSource / 6) * 100 : 180 + Math.floor(assetNodesLinkedToSource / 4) * 70;
        
        const sourceNodeX = sourceNodeInstance.position?.x ?? 400;
        const sourceNodeY = sourceNodeInstance.position?.y ?? 100;
        
        // Adjust angle start to ensure nodes spread out below the source
        let angleStart = Math.PI / 2; // Start directly below
        if (sourceNodeId === UNION_NODE_ID) {
             angleStart = Math.PI / 2 - ( (assetNodesLinkedToSource > 0 ? assetNodesLinkedToSource -1 : 0) * angleStep / 2);
        } else { // Member node
             angleStart = Math.PI / 2 - ( (assetNodesLinkedToSource > 0 ? assetNodesLinkedToSource -1 : 0) * angleStep / 2);
        }
        const angle = angleStart + (assetNodesLinkedToSource * angleStep) ;


        const newAssetNodeX = sourceNodeX + radius * Math.cos(angle);
        const newAssetNodeY = sourceNodeY + (sourceNodeInstance.height ?? 150) + 50 + radius * Math.sin(angle);


        let nodeDataPayload: AssetNodeData;
        if (formData.tipo === 'digital') {
          nodeDataPayload = {
            name: formData.nomeAtivo,
            assetMainType: 'digital',
            digitalAssetType: formData.tipoAtivoDigital,
            quantity: formData.quantidadeDigital || 0,
            assignedToMemberId: processedAssignedToMemberId,
            releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
          };
        } else {
          nodeDataPayload = {
            name: formData.nomeAtivo,
            assetMainType: 'fisico',
            physicalAssetType: formData.tipoImovelBemFisico,
            assignedToMemberId: processedAssignedToMemberId,
            releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
          };
        }

        const newAssetNode: Node<AssetNodeData> = {
          id: result.assetId,
          type: 'assetNode',
          data: nodeDataPayload,
          position: { x: newAssetNodeX, y: newAssetNodeY },
          draggable: true,
          nodeOrigin,
        };
        setNodes((prevNodes) => prevNodes.concat(newAssetNode));

        const newEdge: Edge = {
          id: `e-${sourceNodeId}-${result.assetId}`,
          source: sourceNodeId,
          target: result.assetId,
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
        };
        setEdges((prevEdges) => prevEdges.concat(newEdge));
      }
      setIsAssetModalOpen(false);
      setMemberContextForAssetAdd(null);
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

       const newMember: MemberWithBirthDate = {
        id: result.memberId,
        unionId: UNION_NODE_ID,
        nome: data.nome,
        tipoRelacao: data.tipoRelacao,
        dataNascimento: data.dataNascimento,
      };
      setAllMembers(prev => [...prev, newMember]);


      const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID);
      if (!unionNodeInstance) {
        setIsSubmittingMember(false);
        return;
      }

      const memberNodesCount = nodes.filter(n => n.type === 'memberNode').length;
      const angleStep = Math.PI / 4;
      const radius = 250 + Math.floor(memberNodesCount / 6) * 100;

      const unionNodeX = unionNodeInstance.position?.x ?? 400;
      const unionNodeY = unionNodeInstance.position?.y ?? 100;
      
      let angleStart = Math.PI + Math.PI / 2; // Start from the left-bottom quarter for members
      const angle = angleStart + (memberNodesCount * angleStep);


      const newMemberNodeX = unionNodeX + radius * Math.cos(angle);
      const newMemberNodeY = unionNodeY + (unionNodeInstance.height ?? 150) + 50 + radius * Math.sin(angle);

      const nodeDataPayload: MemberNodeData = {
        id: result.memberId,
        name: data.nome,
        relationshipType: data.tipoRelacao,
        onAddAssetClick: handleOpenAssetModalForMember,
      };

      const newMemberNodeReactFlow: Node<MemberNodeData> = {
        id: result.memberId,
        type: 'memberNode',
        data: nodeDataPayload,
        position: { x: newMemberNodeX, y: newMemberNodeY },
        draggable: true,
        nodeOrigin,
      };
      setNodes((prevNodes) => prevNodes.concat(newMemberNodeReactFlow));

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
  
  const availableMembersForAssetForm = allMembers.map(member => ({
      id: member.id!,
      name: member.nome,
      birthDate: member.dataNascimento, 
    }));


  if (authLoading && !nodes.find(n => n.id === UNION_NODE_ID)) {
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,60px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,60px)-1rem)] py-2">
      <Dialog open={isAssetModalOpen} onOpenChange={(isOpen) => {
        setIsAssetModalOpen(isOpen);
        if (!isOpen) setMemberContextForAssetAdd(null); 
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Adicionar Novo Ativo</DialogTitle>
            <DialogDescription>Preencha os detalhes do seu ativo.</DialogDescription>
          </DialogHeader>
          <AssetForm
            onSubmit={handleAddAssetSubmit}
            isLoading={isSubmittingAsset}
            onClose={() => {
                setIsAssetModalOpen(false);
                setMemberContextForAssetAdd(null);
            }}
            availableMembers={availableMembersForAssetForm}
            targetMemberId={memberContextForAssetAdd}
          />
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
          fitViewOptions={{ padding: 0.2, duration: 800 }}
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

declare module 'reactflow' {
  interface NodeData {
    // From UnionNodeData
    id?: string; // Already in ReactFlow Node, but can be explicitly part of data too
    label?: string;
    onSettingsClick?: () => void;
    onOpenAssetModal?: () => void;
    onAddMember?: () => void;
    // From AssetNodeData
    name?: string; // name of asset
    assetMainType?: 'digital' | 'fisico';
    digitalAssetType?: string;
    quantity?: number;
    physicalAssetType?: string;
    releaseCondition?: { type: 'age'; targetAge: number };
    assignedToMemberId?: string;
    // From MemberNodeData
    // name?: string; // name of member, already covered by AssetNodeData.name
    relationshipType?: string;
    onAddAssetClick?: (memberId: string) => void; 
  }
}

    