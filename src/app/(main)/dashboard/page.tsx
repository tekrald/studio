
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData, AssetTransaction, DigitalAsset, PhysicalAsset } from '@/types/asset'; // AssetFormData será para Físicos
import { addAsset } from '@/actions/assetActions';
import { AddMemberForm } from '@/components/members/AddMemberForm';
import type { MemberFormData, Member } from '@/types/member';
import { addMember } from '@/actions/memberActions';

import { useToast } from '@/hooks/use-toast';
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
import { AssetNode, type AssetNodeDataProps } from '@/components/nodes/AssetNode'; 
import { MemberNode, type MemberNodeDataProps } from '@/components/nodes/MemberNode'; 
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Label } from '@/components/ui/label';


const UNION_NODE_ID = 'union-node';
const nodeOrigin: NodeOrigin = [0.5, 0.5];

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

// Tipos para os dados dos nós customizados
// AssetNodeDataProps é importado do AssetNode.tsx
// MemberNodeDataProps é importado do MemberNode.tsx

interface MemberWithBirthDate extends Member {
  dataNascimento?: Date | string; 
}

const nodeTypes = {
  unionNode: UnionNode,
  assetNode: AssetNode,
  memberNode: MemberNode,
};


export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [memberContextForAssetAdd, setMemberContextForAssetAdd] = useState<string | null>(null);


  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<UnionNodeData | AssetNodeDataProps | MemberNodeDataProps>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [allMembers, setAllMembers] = useState<MemberWithBirthDate[]>([]);

  const [isContractSettingsModalOpen, setIsContractSettingsModalOpen] = useState(false);
  const [contractClauses, setContractClauses] = useState<ContractClause[]>([
    { id: 'initial-1', text: 'Todos os bens adquiridos durante a união serão divididos igualmente (50/50) em caso de separação.' },
    { id: 'initial-2', text: 'As despesas ordinárias do lar serão custeadas por ambos os cônjuges, na proporção de seus respectivos rendimentos.' },
  ]);

  const [isAssetDetailsModalOpen, setIsAssetDetailsModalOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<AssetNodeDataProps | null>(null);


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

  // Esta função agora é para abrir o modal para ADICIONAR UM NOVO ATIVO FÍSICO à união principal
  const handleOpenAssetModalForUnion = useCallback(() => {
    setMemberContextForAssetAdd(null); 
    setIsAssetModalOpen(true);
  }, []);

  // Esta função agora é para abrir o modal para ADICIONAR UM NOVO ATIVO FÍSICO a um membro específico
  const handleOpenAssetModalForMember = useCallback((memberId: string) => {
    setMemberContextForAssetAdd(memberId);
    setIsAssetModalOpen(true);
  }, []);


  const handleOpenAddMemberModal = useCallback(() => {
    setIsAddMemberModalOpen(true);
  }, []);

  const handleOpenAssetDetailsModal = useCallback((assetData: AssetNodeDataProps) => {
    setSelectedAssetForDetails(assetData);
    setIsAssetDetailsModalOpen(true);
  }, []);

  const handleCloseAssetDetailsModal = useCallback(() => {
    setIsAssetDetailsModalOpen(false);
    setSelectedAssetForDetails(null);
  }, []);

  const effectiveUser = user || { 
    uid: 'mock-uid-default', 
    displayName: 'Nossa União (Mock)',
    email: 'mock@example.com',
    holdingType: '',
    relationshipStructure: '',
    religion: '',
    isWalletConnected: false,
    connectedWalletAddress: null,
  };
  

 useEffect(() => {
    const currentUnionNode = nodes.find(node => node.id === UNION_NODE_ID);
    let unionNodeCreated = false;

    if (!currentUnionNode && !authLoading && effectiveUser?.displayName) {
      const unionNode: Node<UnionNodeData> = {
        id: UNION_NODE_ID,
        type: 'unionNode',
        position: { x: 400, y: 100 },
        data: {
          label: effectiveUser.displayName || 'Nossa União',
          onSettingsClick: handleOpenContractSettings,
          onOpenAssetModal: handleOpenAssetModalForUnion, // Modificado para função específica da união
          onAddMember: handleOpenAddMemberModal,
        },
        draggable: true,
        nodeOrigin,
      };
      setNodes([unionNode]);
      unionNodeCreated = true;
    } else if (currentUnionNode && effectiveUser?.displayName && (currentUnionNode.data as UnionNodeData).label !== effectiveUser.displayName) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === UNION_NODE_ID
            ? { ...node, data: { ...(node.data as UnionNodeData), label: effectiveUser.displayName! } }
            : node
        )
      );
    }

    // Auto-add mock digital assets if wallet is "connected"
    if (user?.isWalletConnected && (currentUnionNode || unionNodeCreated) && !authLoading) {
        const mockDigitalAssets: Node<AssetNodeDataProps>[] = [
            { 
                id: 'mock-btc', type: 'assetNode', position: { x: 250, y: 350 }, draggable: true, nodeOrigin,
                data: { 
                    id: 'mock-btc', userId: effectiveUser.uid, nomeAtivo: 'Bitcoin', tipo: 'digital', 
                    quantidadeTotalDigital: 0.5, 
                    transactions: [{id: 'tx-btc-1', dataAquisicao: new Date(2023,0,1), quantidadeDigital: 0.5, valorPagoEpoca: 30000, quemComprou: 'Ambos'}],
                    onOpenDetails: () => {} // Será preenchido abaixo
                }
            },
            { 
                id: 'mock-eth', type: 'assetNode', position: { x: 550, y: 350 }, draggable: true, nodeOrigin,
                data: { 
                    id: 'mock-eth', userId: effectiveUser.uid, nomeAtivo: 'Ethereum', tipo: 'digital',
                    quantidadeTotalDigital: 10, 
                    transactions: [{id: 'tx-eth-1', dataAquisicao: new Date(2023,5,10), quantidadeDigital: 10, valorPagoEpoca: 2000, quemComprou: 'Ambos'}],
                    onOpenDetails: () => {} // Será preenchido abaixo
                } 
            },
        ];
        
        const newNodesToAdd: Node<AssetNodeDataProps>[] = [];
        const newEdgesToAdd: Edge[] = [];

        mockDigitalAssets.forEach((mockAssetNode) => {
            if (!nodes.find(n => n.id === mockAssetNode.id)) {
                // Atualiza onOpenDetails para o mockAssetNode.data
                const assetDataForDetails = { ...mockAssetNode.data };
                mockAssetNode.data.onOpenDetails = () => handleOpenAssetDetailsModal(assetDataForDetails);
                
                newNodesToAdd.push(mockAssetNode);
                newEdgesToAdd.push({
                    id: `e-${UNION_NODE_ID}-${mockAssetNode.id}`,
                    source: UNION_NODE_ID,
                    target: mockAssetNode.id,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
                    style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
                });
            }
        });
        
        if (newNodesToAdd.length > 0) {
            setNodes(prevNodes => [...prevNodes, ...newNodesToAdd]);
            setEdges(prevEdges => [...prevEdges, ...newEdgesToAdd]);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, effectiveUser, user?.isWalletConnected, handleOpenContractSettings, handleOpenAssetModalForUnion, handleOpenAddMemberModal]);


  const memberHasBirthDate = (memberId?: string): boolean => {
    if (!memberId) return false;
    const member = allMembers.find(m => m.id === memberId);
    return !!member?.dataNascimento;
  };

  // Esta função agora é para adicionar um ATIVO FÍSICO
  const handleAddAssetSubmit = async (formData: AssetFormData) => {
    if (!effectiveUser) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
    // A action `addAsset` agora espera AssetFormData que é para ativos físicos
    const result = await addAsset(formData, effectiveUser.uid); 

    if (result.success && result.assetId && result.transactionId) {
      toast({ title: 'Sucesso!', description: 'Ativo físico adicionado com sucesso.' });

      const newTransaction: AssetTransaction = {
        id: result.transactionId,
        dataAquisicao: formData.dataAquisicao,
        // Não há quantidadeDigital ou valorPagoEpocaDigital para ativos físicos desta forma
        quemComprou: formData.quemComprou,
        contribuicaoParceiro1: formData.contribuicaoParceiro1,
        contribuicaoParceiro2: formData.contribuicaoParceiro2,
        observacoes: formData.observacoes,
      };
      
      const processedAssignedToMemberId = memberContextForAssetAdd || (formData.assignedToMemberId === "UNASSIGNED" ? undefined : formData.assignedToMemberId);
      
      // Lógica para adicionar novo nó de ativo físico
      const sourceNodeId = processedAssignedToMemberId || UNION_NODE_ID;
      const sourceNodeInstance = nodes.find(n => n.id === sourceNodeId);

      if (!sourceNodeInstance) {
        console.error("Nó de origem (União ou Membro) não encontrado.", sourceNodeId);
        setIsSubmittingAsset(false);
        setMemberContextForAssetAdd(null);
        return;
      }
      
      const assetNodesLinkedToSource = nodes.filter(n => {
          if (n.type !== 'assetNode') return false;
          const nodeData = n.data as AssetNodeDataProps;
          let isLinked = false;
          if(sourceNodeId === UNION_NODE_ID){
              isLinked = !nodeData.assignedToMemberId;
          } else {
              isLinked = nodeData.assignedToMemberId === sourceNodeId;
          }
          const edgeExists = edges.some(edge => edge.source === sourceNodeId && edge.target === n.id);
          return isLinked && edgeExists;
      }).length;

      const angleStep = sourceNodeId === UNION_NODE_ID ? Math.PI / 4 : Math.PI / 3; 
      const radius = sourceNodeId === UNION_NODE_ID ? 250 + Math.floor(assetNodesLinkedToSource / 6) * 100 : 180 + Math.floor(assetNodesLinkedToSource / 4) * 70;
      const sourceNodeX = sourceNodeInstance.position?.x ?? 400;
      const sourceNodeY = sourceNodeInstance.position?.y ?? 100;
      let angleStart = sourceNodeId === UNION_NODE_ID ? (Math.PI / 2) : (Math.PI * 0.75) ; 
      if (sourceNodeId === UNION_NODE_ID) {
          angleStart = Math.PI / 2 - ( (assetNodesLinkedToSource > 0 ? assetNodesLinkedToSource -1 : 0) * angleStep / 2);
      } else { 
          angleStart = (sourceNodeInstance?.type === 'memberNode' ? (3 * Math.PI / 4) : (Math.PI/2) ) - ( (assetNodesLinkedToSource > 0 ? assetNodesLinkedToSource -1 : 0) * angleStep / 2);
      }
      const angle = angleStart + (assetNodesLinkedToSource * angleStep) ;
      const newAssetNodeX = sourceNodeX + radius * Math.cos(angle);
      const newAssetNodeY = sourceNodeY + (sourceNodeInstance.height ?? (sourceNodeInstance.type === 'unionNode' ? 100 : 80)) + 50 + radius * Math.sin(angle);

      const nodeDataPayload: AssetNodeDataProps = {
          id: result.assetId!, 
          userId: effectiveUser.uid,
          nomeAtivo: formData.nomeAtivo,
          tipo: 'fisico', // Hardcoded
          tipoImovelBemFisico: formData.tipoImovelBemFisico!,
          enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico,
          transactions: [newTransaction], 
          assignedToMemberId: processedAssignedToMemberId,
          releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge && memberHasBirthDate(processedAssignedToMemberId) ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
          // Campos de DigitalAsset não são aplicáveis aqui, mas o tipo AssetNodeDataProps os inclui como opcionais
          quantidadeTotalDigital: 0, // Placeholder
          onOpenDetails: () => {} 
      };
      nodeDataPayload.onOpenDetails = () => handleOpenAssetDetailsModal(nodeDataPayload);

      const newAssetNodeReactFlow: Node<AssetNodeDataProps> = {
        id: result.assetId!,
        type: 'assetNode',
        data: nodeDataPayload,
        position: { x: newAssetNodeX, y: newAssetNodeY },
        draggable: true,
        nodeOrigin,
      };
      setNodes((prevNodes) => prevNodes.concat(newAssetNodeReactFlow));

      const newEdge: Edge = {
        id: `e-${sourceNodeId}-${result.assetId!}`,
        source: sourceNodeId,
        target: result.assetId!,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
      };
      setEdges((prevEdges) => prevEdges.concat(newEdge));
      
      setIsAssetModalOpen(false);
      setMemberContextForAssetAdd(null);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o ativo físico.', variant: 'destructive' });
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
      let angleStart = Math.PI + Math.PI / 2; 
      const angle = angleStart + (memberNodesCount * angleStep);
      const newMemberNodeX = unionNodeX + radius * Math.cos(angle);
      const newMemberNodeY = unionNodeY + (unionNodeInstance.height ?? 100) + 50 + radius * Math.sin(angle);

      const nodeDataPayload: MemberNodeDataProps = {
        id: result.memberId,
        name: data.nome, // Corrigido de nome para name
        relationshipType: data.tipoRelacao, // Corrigido de tipoRelacao para relationshipType
        onAddAssetClick: (memberId) => handleOpenAssetModalForMember(memberId), // Adicionado callback
      };

      const newMemberNodeReactFlow: Node<MemberNodeDataProps> = {
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
  
  const getMemberNameById = (memberId?: string) => {
    if (!memberId) return 'União Principal';
    const member = allMembers.find(m => m.id === memberId);
    return member ? member.nome : 'Membro Desconhecido';
  };


  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,60px)-1rem)] py-2">
      <Dialog open={isAssetModalOpen} onOpenChange={(isOpen) => {
        setIsAssetModalOpen(isOpen);
        if (!isOpen) {
            setMemberContextForAssetAdd(null); 
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Adicionar Novo Ativo Físico</DialogTitle>
            <DialogDescription>Preencha os detalhes do seu ativo físico.</DialogDescription>
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
            user={user}
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

       <Dialog open={isAssetDetailsModalOpen} onOpenChange={handleCloseAssetDetailsModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Detalhes do Ativo: {selectedAssetForDetails?.nomeAtivo}</DialogTitle>
            <DialogDescription>
              Informações sobre o ativo e histórico de aquisições.
            </DialogDescription>
          </DialogHeader>
          {selectedAssetForDetails && (
            <div className="space-y-4 py-4 text-sm">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Nome do Ativo</Label>
                <p className="font-semibold text-foreground">{selectedAssetForDetails.nomeAtivo}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Tipo Principal</Label>
                <p className="text-foreground capitalize">{selectedAssetForDetails.tipo}</p>
              </div>

              {selectedAssetForDetails.tipo === 'digital' && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Quantidade Total</Label>
                  <p className="text-foreground">{(selectedAssetForDetails as AssetNodeDataProps).quantidadeTotalDigital?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) || 'N/A'}</p>
                </div>
              )}
              {selectedAssetForDetails.tipo === 'fisico' && (
                <>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Tipo de Bem Físico</Label>
                    <p className="text-foreground">{(selectedAssetForDetails as AssetNodeDataProps).tipoImovelBemFisico || 'Não especificado'}</p>
                  </div>
                  {(selectedAssetForDetails as AssetNodeDataProps).enderecoLocalizacaoFisico && (
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">Endereço/Localização</Label>
                        <p className="text-foreground">{(selectedAssetForDetails as AssetNodeDataProps).enderecoLocalizacaoFisico}</p>
                    </div>
                  )}
                </>
              )}
              
              {selectedAssetForDetails.assignedToMemberId && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Designado para</Label>
                  <p className="text-foreground">{getMemberNameById(selectedAssetForDetails.assignedToMemberId)}</p>
                </div>
              )}
              {selectedAssetForDetails.releaseCondition?.type === 'age' && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Condição de Liberação</Label>
                  <p className="text-foreground">Liberar aos {selectedAssetForDetails.releaseCondition.targetAge} anos</p>
                </div>
              )}
              {selectedAssetForDetails.observacoesGerais && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Observações Gerais do Ativo</Label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedAssetForDetails.observacoesGerais}</p>
                </div>
              )}

              <div className="space-y-3 pt-3 mt-3 border-t">
                <h4 className="text-md font-semibold text-primary">Histórico de Aquisições/Transações</h4>
                {selectedAssetForDetails.transactions && selectedAssetForDetails.transactions.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                    {selectedAssetForDetails.transactions.map((tx, index) => (
                      <Card key={tx.id || index} className="p-3 bg-muted/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Data da Aquisição</Label>
                            <p className="text-foreground">{format(new Date(tx.dataAquisicao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                          </div>
                          {tx.quantidadeDigital !== undefined && selectedAssetForDetails.tipo === 'digital' && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Quantidade Adquirida</Label>
                              <p className="text-foreground">{tx.quantidadeDigital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
                            </div>
                          )}
                          {tx.valorPagoEpoca !== undefined && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Valor Pago na Época</Label>
                              <p className="text-foreground">{typeof tx.valorPagoEpoca === 'number' ? tx.valorPagoEpoca.toLocaleString(undefined, { style: 'currency', currency: 'BRL' }) : tx.valorPagoEpoca}</p>
                            </div>
                          )}
                           {tx.quemComprou && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Adquirido por</Label>
                              <p className="text-foreground">{effectiveUser?.displayName?.includes(tx.quemComprou) ? tx.quemComprou : getMemberNameById(tx.quemComprou)}</p>
                            </div>
                          )}
                          {tx.quemComprou === 'Ambos' && (
                            <>
                              {tx.contribuicaoParceiro1 !== undefined && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Contrib. ({user?.displayName?.split('&')[0]?.trim() || 'Parceiro 1'})</Label>
                                  <p className="text-foreground">{tx.contribuicaoParceiro1.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                              )}
                              {tx.contribuicaoParceiro2 !== undefined && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Contrib. ({user?.displayName?.split('&')[1]?.trim() || 'Parceiro 2'})</Label>
                                  <p className="text-foreground">{tx.contribuicaoParceiro2.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {tx.observacoes && (
                          <div className="mt-2 pt-2 border-t border-dashed">
                            <Label className="text-xs font-medium text-muted-foreground">Observações da Transação</Label>
                            <p className="text-foreground whitespace-pre-wrap text-xs">{tx.observacoes}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma transação registrada para este ativo.</p>
                )}
              </div>

              <div className="pt-4">
                <Button onClick={handleCloseAssetDetailsModal} className="w-full" variant="outline">Fechar</Button>
              </div>
            </div>
          )}
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
          <Controls showFitView={false} showInteractive={false} />
          <Background gap={16} color="hsl(var(--border))" />
        </ReactFlow>
      </div>
    </div>
  );
}

declare module 'reactflow' {
  interface NodeData extends Partial<UnionNodeData>, Partial<AssetNodeDataProps>, Partial<MemberNodeDataProps> {}
}
