
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { LayoutGrid, Plus, Network, DollarSign, Settings, PlusCircle, Users as UsersIcon } from 'lucide-react'; // Added Plus, Network, DollarSign, Settings, PlusCircle, UsersIcon
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
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog';


const UNION_NODE_ID = 'union-node';
const nodeOrigin: NodeOrigin = [0.5, 0.5];

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes = {
  unionNode: UnionNode,
};

interface AssetNodeData {
  label: string;
  assetId: string;
  type: 'asset';
  assetType: 'digital' | 'fisico';
  originalName: string; // To find and consolidate digital assets
  // Digital asset specific
  digitalAssetType?: DigitalAsset['tipoAtivoDigital'];
  quantity?: number;
  // Physical asset specific
  physicalAssetType?: PhysicalAsset['tipoImovelBemFisico'];
}

interface MemberNodeData {
  label: string;
  memberId: string;
  type: 'member';
  originalName: string;
  relationshipType: MemberFormData['tipoRelacao'];
}


export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth(); 
  const { toast } = useToast();
  
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<UnionNodeData | AssetNodeData | MemberNodeData>(initialNodes);
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
    if (!currentUnionNode && !authLoading) { 
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
    }
  }, [ nodes, setNodes, handleOpenContractSettings, handleOpenAssetModal, handleOpenAddMemberModal, authLoading, effectiveUser.displayName]);


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
      if (data.tipo === 'digital' && data.nomeAtivo && data.tipoAtivoDigital && data.quantidadeDigital !== undefined) {
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            if (
              node.data.type === 'asset' &&
              node.data.assetType === 'digital' &&
              node.data.originalName === data.nomeAtivo &&
              node.data.digitalAssetType === data.tipoAtivoDigital 
            ) {
              assetNodeExists = true;
              const existingData = node.data as AssetNodeData & { digitalAssetType: DigitalAsset['tipoAtivoDigital'], quantity: number };
              const newQuantity = (existingData.quantity || 0) + (data.quantidadeDigital || 0);
              return {
                ...node,
                data: {
                  ...existingData,
                  quantity: newQuantity,
                  label: `${existingData.originalName} (${data.tipoAtivoDigital}) (Qtd: ${newQuantity.toFixed(2)})`,
                },
              };
            }
            return node;
          })
        );
      }

      if (!assetNodeExists) {
        const assetNodesCount = nodes.filter(n => n.data.type === 'asset').length;
        const angleStep = Math.PI / 4; 
        const radius = 250 + Math.floor(assetNodesCount / 6) * 70;
        
        const unionNodeX = unionNodeInstance.position?.x ?? 400;
        const unionNodeY = unionNodeInstance.position?.y ?? 100;
        const angle = (assetNodesCount * angleStep) + (Math.PI / 8); 


        const newAssetNodeX = unionNodeX + radius * Math.cos(angle);
        const newAssetNodeY = unionNodeY + (unionNodeInstance.height ?? 100) / 2 + 50 + radius * Math.sin(angle);
        
        let nodeLabel = data.nomeAtivo;
        let nodeDataPayload: AssetNodeData;

        if (data.tipo === 'digital') {
          nodeLabel = `${data.nomeAtivo} (${data.tipoAtivoDigital || 'Digital'}) (Qtd: ${(data.quantidadeDigital || 0).toFixed(2)})`;
          nodeDataPayload = {
            label: nodeLabel,
            assetId: result.assetId,
            type: 'asset',
            assetType: 'digital',
            originalName: data.nomeAtivo,
            digitalAssetType: data.tipoAtivoDigital,
            quantity: data.quantidadeDigital || 0,
          };
        } else { // fisico
          nodeLabel = `${data.nomeAtivo} (${data.tipoImovelBemFisico || 'Físico'})`;
           nodeDataPayload = {
            label: nodeLabel,
            assetId: result.assetId,
            type: 'asset',
            assetType: 'fisico',
            originalName: data.nomeAtivo,
            physicalAssetType: data.tipoImovelBemFisico
          };
        }

        const newAssetNode: Node<AssetNodeData> = {
          id: result.assetId,
          type: 'default', 
          data: nodeDataPayload,
          position: { x: newAssetNodeX, y: newAssetNodeY },
          draggable: true,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
            width: 'auto', 
            minWidth: 150, 
            maxWidth: 220, 
            padding: '10px',
            borderRadius: 'var(--radius)',
            fontSize: '0.85rem', 
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            whiteSpace: 'normal', 
            wordBreak: 'break-word', 
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

      const memberNodesCount = nodes.filter(n => n.data.type === 'member').length;
      const angleStep = Math.PI / 4; 
      const radius = 220 + Math.floor(memberNodesCount / 6) * 60;
      
      const unionNodeX = unionNodeInstance.position?.x ?? 400;
      const unionNodeY = unionNodeInstance.position?.y ?? 100;
      const angle = (memberNodesCount * angleStep) + (Math.PI * 5/8); 


      const newMemberNodeX = unionNodeX + radius * Math.cos(angle);
      const newMemberNodeY = unionNodeY + (unionNodeInstance.height ?? 100) / 2 + 50 + radius * Math.sin(angle);

      const nodeLabel = `${data.tipoRelacao}: ${data.nome}`;
      const nodeDataPayload: MemberNodeData = {
        label: nodeLabel,
        memberId: result.memberId,
        type: 'member',
        originalName: data.nome,
        relationshipType: data.tipoRelacao,
      };

      const newMemberNode: Node<MemberNodeData> = {
        id: result.memberId,
        type: 'default',
        data: nodeDataPayload,
        position: { x: newMemberNodeX, y: newMemberNodeY },
        draggable: true,
        style: {
          background: 'hsl(var(--accent))', 
          color: 'hsl(var(--accent-foreground))',
          border: '1px solid hsl(var(--ring))',
          width: 'auto',
          minWidth: 160,
          maxWidth: 220,
          padding: '10px',
          borderRadius: 'var(--radius)',
          fontSize: '0.85rem',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
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
      <div className="flex flex-col h-[calc(100vh-var(--header-height,60px)-2rem)]">
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
        
        <div className="flex-grow shadow-lg relative overflow-hidden rounded-md border-2 border-dashed border-gray-300 bg-muted/30">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes} 
            fitView
            fitViewOptions={{ padding: 0.2 }}
            attributionPosition="bottom-left"
            proOptions={{ hideAttribution: true }}
            nodeOrigin={nodeOrigin}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Controls />
            <Background gap={16} />
          </ReactFlow>
          {nodes.length <= 1 && !authLoading && ( 
              <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground pointer-events-none">
                <div>
                    <LayoutGrid size={64} className="mx-auto mb-4 opacity-50" />
                    <p className="text-xl">Seu canvas de gestão familiar aparecerá aqui.</p>
                    <p className="text-sm">Use o <PlusCircle size={14} className="inline text-primary"/> no nó da União para adicionar ativos ou membros.</p>
                </div>
            </div>
          )}
        </div>
      </div>
  );
}

interface ExtendedUnionNodeData extends UnionNodeData {
    type: 'union';
}

interface BaseNodeData {
    label: string;
    type: 'asset' | 'member' | 'union';
    originalName: string; // For identification
}

declare module 'reactflow' {
    interface NodeData extends Partial<UnionNodeData>, Partial<AssetNodeData>, Partial<MemberNodeData>, Partial<BaseNodeData> {}
}
