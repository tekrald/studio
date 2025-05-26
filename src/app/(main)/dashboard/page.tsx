
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Users, DollarSign, Settings, Network } from 'lucide-react'; 
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData, AssetTransaction } from '@/types/asset'; // Renomeado DigitalAsset para Asset
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
import { AssetNode, type ExtendedAssetNodeData } from '@/components/nodes/AssetNode';
import { MemberNode, type MemberNodeData } from '@/components/nodes/MemberNode';
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Label } from '@/components/ui/label';


const UNION_NODE_ID = 'union-node'; // ID do nó principal da entidade/registro
const nodeOrigin: NodeOrigin = [0.5, 0.5];

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

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

  const [nodes, setNodes, onNodesChange] = useNodesState<UnionNodeData | ExtendedAssetNodeData | MemberNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [allMembers, setAllMembers] = useState<MemberWithBirthDate[]>([]);

  const [isContractSettingsModalOpen, setIsContractSettingsModalOpen] = useState(false);
  const [contractClauses, setContractClauses] = useState<ContractClause[]>([
    { id: 'initial-1', text: 'Todos os ativos adquiridos conjuntamente serão divididos conforme acordado em caso de dissolução da sociedade.' },
    { id: 'initial-2', text: 'As responsabilidades financeiras e operacionais serão divididas conforme definido neste registro.' },
  ]);

  const [isAssetDetailsModalOpen, setIsAssetDetailsModalOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<ExtendedAssetNodeData | null>(null);


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
    toast({ title: 'Cláusula Adicionada', description: 'Nova cláusula salva nos acordos.' });
  };

  const handleRemoveClause = (id: string) => {
    setContractClauses(prev => prev.filter(clause => clause.id !== id));
    toast({ title: 'Cláusula Removida', description: 'A cláusula foi removida dos acordos.' });
  };

  const handleUpdateContractClause = (id: string, newText: string) => {
    setContractClauses(prev => prev.map(clause => clause.id === id ? { ...clause, text: newText } : clause));
    toast({ title: 'Cláusula Atualizada', description: 'A cláusula foi modificada com sucesso.' });
  };

  const handleOpenAssetModalForUnion = useCallback(() => {
    setMemberContextForAssetAdd(null);
    setIsAssetModalOpen(true);
  }, []);

  const handleOpenAssetModalForMember = useCallback((memberId: string) => {
    setMemberContextForAssetAdd(memberId);
    setIsAssetModalOpen(true);
  }, []);


  const handleOpenAddMemberModal = useCallback(() => {
    setIsAddMemberModalOpen(true);
  }, []);

  const handleOpenAssetDetailsModal = useCallback((assetData: ExtendedAssetNodeData) => {
    setSelectedAssetForDetails(assetData);
    setIsAssetDetailsModalOpen(true);
  }, []);

  const handleCloseAssetDetailsModal = useCallback(() => {
    setIsAssetDetailsModalOpen(false);
    setSelectedAssetForDetails(null);
  }, []);

  const effectiveUser = user || {
    uid: 'mock-uid-default',
    displayName: 'Meu Registro em Ipê City (Mock)', // Nome Padrão da Entidade
    email: 'mock@example.com',
    holdingType: '',
    relationshipStructure: '',
    religion: '',
    isWalletConnected: false,
    connectedWalletAddress: null,
    cnpjHolding: '',
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
          label: effectiveUser.displayName || 'Meu Registro Ipê',
          onSettingsClick: handleOpenContractSettings,
          onOpenAssetModal: handleOpenAssetModalForUnion,
          onAddMember: handleOpenAddMemberModal,
        },
        draggable: true,
        nodeOrigin,
      };
      setNodes([unionNode]);
      setEdges([]); 
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

    if (user?.isWalletConnected && (currentUnionNode || unionNodeCreated) && !authLoading) {
        const mockDigitalAssets: Node<ExtendedAssetNodeData>[] = [
            {
                id: 'mock-btc', type: 'assetNode', position: { x: 250, y: 350 }, draggable: true, nodeOrigin,
                data: {
                    id: 'mock-btc', userId: effectiveUser.uid, nomeAtivo: 'Bitcoin', tipo: 'digital',
                    transactions: [{id: 'tx-btc-1', dataAquisicao: new Date(2023,0,1), quantidadeDigital: 0.5, valorPagoEpoca: 150000, quemComprou: 'Entidade Principal'}],
                    quantidadeTotalDigital: 0.5,
                    onOpenDetails: () => {}
                }
            },
            {
                id: 'mock-eth', type: 'assetNode', position: { x: 550, y: 350 }, draggable: true, nodeOrigin,
                data: {
                    id: 'mock-eth', userId: effectiveUser.uid, nomeAtivo: 'Ethereum', tipo: 'digital',
                    transactions: [{id: 'tx-eth-1', dataAquisicao: new Date(2023,5,10), quantidadeDigital: 10, valorPagoEpoca: 10000, quemComprou: 'Entidade Principal'}],
                    quantidadeTotalDigital: 10,
                    onOpenDetails: () => {}
                }
            },
        ];

        const nodesToAddThisRun: Node<ExtendedAssetNodeData>[] = [];
        const edgesToAddThisRun: Edge[] = [];

        mockDigitalAssets.forEach((mockAssetNode) => {
            const nodeExists = nodes.some(n => n.id === mockAssetNode.id);
            const edgeId = `e-${UNION_NODE_ID}-${mockAssetNode.id}`;
            const edgeAlreadyExistsInState = edges.some(e => e.id === edgeId);

            if (!nodeExists) {
                const assetDataForDetails = { ...mockAssetNode.data }; 
                mockAssetNode.data.onOpenDetails = () => handleOpenAssetDetailsModal(assetDataForDetails);
                nodesToAddThisRun.push(mockAssetNode);
                if (!edgeAlreadyExistsInState) {
                    edgesToAddThisRun.push({
                        id: edgeId,
                        source: UNION_NODE_ID,
                        target: mockAssetNode.id,
                        type: 'smoothstep',
                        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
                        style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
                    });
                }
            }
        });

        if (nodesToAddThisRun.length > 0) {
             setNodes(prevNodes => {
                const currentIds = new Set(prevNodes.map(n => n.id));
                const uniqueNewNodes = nodesToAddThisRun.filter(newNode => !currentIds.has(newNode.id));
                return [...prevNodes, ...uniqueNewNodes];
            });
        }
        if (edgesToAddThisRun.length > 0) {
            setEdges(prevEdges => {
                const currentEdgeIds = new Set(prevEdges.map(e => e.id));
                const uniqueNewEdges = edgesToAddThisRun.filter(newEdge => !currentEdgeIds.has(newEdge.id));
                return [...prevEdges, ...uniqueNewEdges];
            });
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, effectiveUser, user?.isWalletConnected, handleOpenContractSettings, handleOpenAssetModalForUnion, handleOpenAddMemberModal]);


  const memberHasBirthDate = (memberId?: string): boolean => {
    if (!memberId) return false;
    const member = allMembers.find(m => m.id === memberId);
    return !!member?.dataNascimento;
  };

  const handleAddAssetSubmit = async (formData: AssetFormData) => {
    if (!effectiveUser) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsSubmittingAsset(true);
    const result = await addAsset(formData, effectiveUser.uid); // Esta action agora é para ativos físicos

    if (result.success && result.assetId && result.transactionId) {
      toast({ title: 'Sucesso!', description: 'Ativo físico adicionado com sucesso.' });

      const newTransaction: AssetTransaction = {
        id: result.transactionId,
        dataAquisicao: formData.dataAquisicao,
        quemComprou: formData.quemComprou === "Entidade Principal" ? "Entidade Principal" : formData.quemComprou,
        contribuicaoParceiro1: formData.contribuicaoParceiro1,
        contribuicaoParceiro2: formData.contribuicaoParceiro2,
        observacoes: formData.observacoes,
      };
      
      const processedAssignedToMemberId = memberContextForAssetAdd || (formData.assignedToMemberId === "UNASSIGNED" ? undefined : formData.assignedToMemberId);
      const sourceNodeId = processedAssignedToMemberId || UNION_NODE_ID;
      const sourceNodeInstance = nodes.find(n => n.id === sourceNodeId);

      if (!sourceNodeInstance) {
        console.error("Nó de origem (Registro Principal ou Membro) não encontrado.", sourceNodeId);
        setIsSubmittingAsset(false);
        setMemberContextForAssetAdd(null);
        return;
      }
      
      const assetNodesLinkedToSource = nodes.filter(n => {
        const nodeData = n.data as ExtendedAssetNodeData | MemberNodeData | UnionNodeData;
        if (n.type !== 'assetNode') return false;
        let isLinked = false;
        if (sourceNodeId === UNION_NODE_ID) {
          isLinked = !(nodeData as ExtendedAssetNodeData).assignedToMemberId;
        } else {
          isLinked = (nodeData as ExtendedAssetNodeData).assignedToMemberId === sourceNodeId;
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

      const nodeDataPayload: ExtendedAssetNodeData = {
          id: result.assetId!,
          userId: effectiveUser.uid,
          nomeAtivo: formData.nomeAtivo,
          tipo: 'fisico',
          tipoImovelBemFisico: formData.tipoImovelBemFisico!,
          enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico,
          transactions: [newTransaction],
          assignedToMemberId: processedAssignedToMemberId,
          releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge && memberHasBirthDate(processedAssignedToMemberId) ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
          quantidadeTotalDigital: 0, // Não aplicável para físico
          onOpenDetails: () => {}
      };
      nodeDataPayload.onOpenDetails = () => handleOpenAssetDetailsModal(nodeDataPayload);

      const newAssetNodeReactFlow: Node<ExtendedAssetNodeData> = {
        id: result.assetId!,
        type: 'assetNode',
        data: nodeDataPayload,
        position: { x: newAssetNodeX, y: newAssetNodeY },
        draggable: true,
        nodeOrigin,
      };

      setNodes((prevNodes) => {
        const existingNodeIndex = prevNodes.findIndex(node => node.id === result.assetId);
        if (existingNodeIndex !== -1) {
          return prevNodes;
        }
        return prevNodes.concat(newAssetNodeReactFlow);
      });


      const newEdge: Edge = {
        id: `e-${sourceNodeId}-${result.assetId!}`,
        source: sourceNodeId,
        target: result.assetId!,
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
      };
      setEdges((prevEdges) => {
         if (!prevEdges.find(edge => edge.id === newEdge.id)) {
          return prevEdges.concat(newEdge);
        }
        return prevEdges;
      });

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
      let angleStart = Math.PI + Math.PI / 2; // Inicia abaixo do nó principal
      const angle = angleStart + (memberNodesCount * angleStep);
      const newMemberNodeX = unionNodeX + radius * Math.cos(angle);
      const newMemberNodeY = unionNodeY + (unionNodeInstance.height ?? 100) + 50 + radius * Math.sin(angle);

      const nodeDataPayload: MemberNodeData = {
        id: result.memberId,
        name: data.nome,
        relationshipType: data.tipoRelacao,
        onAddAssetClick: (memberId) => handleOpenAssetModalForMember(memberId),
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

  const getMemberNameById = (memberId?: string) => {
    if (!memberId || memberId === "Entidade Principal") return 'Registro Principal';
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
            <DialogDescription>Insira os dados do novo membro da sua sociedade/registro.</DialogDescription>
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
                  <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData).quantidadeTotalDigital?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) || 'N/A'}</p>
                </div>
              )}
              {selectedAssetForDetails.tipo === 'fisico' && (
                <>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Tipo de Bem Físico</Label>
                    <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData).tipoImovelBemFisico || 'Não especificado'}</p>
                  </div>
                  {(selectedAssetForDetails as ExtendedAssetNodeData).enderecoLocalizacaoFisico && (
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">Endereço/Localização</Label>
                        <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData).enderecoLocalizacaoFisico}</p>
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
                           {tx.quemComprou && ( // Ajustado para exibir corretamente quem comprou
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Adquirido por</Label>
                              <p className="text-foreground">{tx.quemComprou === "Entidade Principal" ? "Registro Principal" : getMemberNameById(tx.quemComprou)}</p>
                            </div>
                          )}
                          {tx.quemComprou === 'Ambos' && effectiveUser?.displayName && ( // Ajustado para nomes da Acta Ipê
                            <>
                              {tx.contribuicaoParceiro1 !== undefined && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Contrib. ({effectiveUser.displayName.split('&')[0]?.trim() || 'Parte 1'})</Label>
                                  <p className="text-foreground">{tx.contribuicaoParceiro1.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</p>
                                </div>
                              )}
                              {tx.contribuicaoParceiro2 !== undefined && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Contrib. ({effectiveUser.displayName.split('&')[1]?.trim() || 'Parte 2'})</Label>
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
                {selectedAssetForDetails.tipo === 'digital' && selectedAssetForDetails.transactions && selectedAssetForDetails.transactions.length > 1 &&(
                  <p className="text-xs text-muted-foreground mt-2">
                    Nota: O campo "Valor Pago na Época" no cabeçalho do ativo reflete a última transação.
                  </p>
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
  interface NodeData extends Partial<UnionNodeData>, Partial<ExtendedAssetNodeData>, Partial<MemberNodeData> {}
}
