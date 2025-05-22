
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Users, Settings, Network, DollarSign, Trash2, Edit3, Plus } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData, AssetTransaction, DigitalAsset, PhysicalAsset, Asset as AssetType } from '@/types/asset'; // Atualizado para novos tipos
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
import { AssetNode, type AssetNodeData } from '@/components/nodes/AssetNode';
import { MemberNode, type MemberNodeData } from '@/components/nodes/MemberNode';
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

const nodeTypes = {
  unionNode: UnionNode,
  assetNode: AssetNode,
  memberNode: MemberNode,
};

// Nó de ativo agora contém uma lista de transações
export type ExtendedAssetNodeData = AssetNodeData & (Omit<DigitalAsset, 'userId'> | Omit<PhysicalAsset, 'userId'>) & {
  transactions: AssetTransaction[];
  // Para ativos digitais, quantidadeTotalDigital já está em DigitalAsset
  // Para ativos físicos, podemos não ter uma "quantidade total" somável da mesma forma
};


export type CustomNodeData = UnionNodeData | ExtendedAssetNodeData | MemberNodeData;

interface MemberWithBirthDate extends Member {
  dataNascimento?: Date | string; 
}

export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [memberContextForAssetAdd, setMemberContextForAssetAdd] = useState<string | null>(null);
  const [existingAssetToUpdate, setExistingAssetToUpdate] = useState<{name: string, type: 'digital' | 'fisico', assignedTo?: string | null} | null>(null);


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

  const handleOpenAssetModal = useCallback((assetToUpdate?: {name: string, type: 'digital' | 'fisico', assignedTo?: string | null}) => {
    setMemberContextForAssetAdd(null); // Reset context unless explicitly for member
    setExistingAssetToUpdate(assetToUpdate || null);
    setIsAssetModalOpen(true);
  }, []);

  const handleOpenAssetModalForMember = useCallback((memberId: string, assetToUpdate?: {name: string, type: 'digital' | 'fisico', assignedTo?: string | null}) => {
    setMemberContextForAssetAdd(memberId);
    setExistingAssetToUpdate(assetToUpdate || null);
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
          onOpenAssetModal: () => handleOpenAssetModal(), // Passando sem arg para novo ativo
          onAddMember: handleOpenAddMemberModal,
        },
        draggable: true,
        nodeOrigin,
      };
      setNodes([unionNode]);
    } else if (currentUnionNode && effectiveUser?.displayName && (currentUnionNode.data as UnionNodeData).label !== effectiveUser.displayName) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === UNION_NODE_ID
            ? { ...node, data: { ...(node.data as UnionNodeData), label: effectiveUser.displayName! } }
            : node
        )
      );
    }
  }, [nodes, setNodes, handleOpenContractSettings, handleOpenAssetModal, handleOpenAddMemberModal, authLoading, effectiveUser]);


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
    const result = await addAsset(formData, effectiveUser.uid); // addAsset agora retorna assetId e transactionId

    if (result.success && result.assetId && result.transactionId) {
      toast({ title: 'Sucesso!', description: 'Transação do ativo adicionada com sucesso.' });

      const newTransaction: AssetTransaction = {
        id: result.transactionId,
        dataAquisicao: formData.dataAquisicao,
        quantidadeDigital: formData.quantidadeDigital,
        valorPagoEpoca: formData.valorPagoEpocaDigital,
        quemComprou: formData.quemComprou,
        contribuicaoParceiro1: formData.contribuicaoParceiro1,
        contribuicaoParceiro2: formData.contribuicaoParceiro2,
        observacoes: formData.observacoes,
      };
      
      const processedAssignedToMemberId = memberContextForAssetAdd || (formData.assignedToMemberId === "UNASSIGNED" ? undefined : formData.assignedToMemberId);

      let existingNode = nodes.find(node =>
        node.type === 'assetNode' &&
        (node.data as ExtendedAssetNodeData).nomeAtivo === formData.nomeAtivo &&
        (node.data as ExtendedAssetNodeData).tipo === formData.tipo &&
        (node.data as ExtendedAssetNodeData).assignedToMemberId === processedAssignedToMemberId
      ) as Node<ExtendedAssetNodeData> | undefined;


      if (existingNode) {
        // Adicionar nova transação ao ativo existente e atualizar
        setNodes(prevNodes =>
          prevNodes.map(n => {
            if (n.id === existingNode!.id) {
              const currentData = n.data as ExtendedAssetNodeData;
              const updatedTransactions = [...currentData.transactions, newTransaction];
              let updatedQuantityTotal = currentData.tipo === 'digital' ? (currentData as ExtendedAssetNodeData & DigitalAsset).quantidadeTotalDigital : 0;

              if (formData.tipo === 'digital' && formData.quantidadeDigital !== undefined) {
                updatedQuantityTotal = updatedTransactions.reduce((sum, tx) => sum + (tx.quantidadeDigital || 0), 0);
              }
              
              const updatedNodeData: ExtendedAssetNodeData = {
                ...currentData,
                transactions: updatedTransactions,
                // Atualizar campos do ativo principal se necessário (ex: releaseCondition, se foi alterado)
                // Por simplicidade, não estamos permitindo alterar designação ou release condition ao adicionar transação
                ...(formData.tipo === 'digital' && { quantidadeTotalDigital: updatedQuantityTotal }),
                 // Os campos como observacoes, dataAquisicao, etc., que agora são por transação,
                 // podem refletir a última transação na visualização principal do nó, se desejado.
                 // Por ora, o AssetNode pega o nome do ativo.
              };
              updatedNodeData.onOpenDetails = () => handleOpenAssetDetailsModal(updatedNodeData);
              return { ...n, data: updatedNodeData };
            }
            return n;
          })
        );
      } else { // Criar novo ativo com sua primeira transação
        const sourceNodeId = processedAssignedToMemberId || UNION_NODE_ID;
        const sourceNodeInstance = nodes.find(n => n.id === sourceNodeId);

        if (!sourceNodeInstance) {
          console.error("Nó de origem (União ou Membro) não encontrado.", sourceNodeId);
          setIsSubmittingAsset(false);
          setMemberContextForAssetAdd(null);
          setExistingAssetToUpdate(null);
          return;
        }
        
        const assetNodesLinkedToSource = nodes.filter(n => {
            if (n.type !== 'assetNode') return false;
            const nodeData = n.data as ExtendedAssetNodeData;
            const isLinkedToUnion = sourceNodeId === UNION_NODE_ID && !nodeData.assignedToMemberId;
            const isLinkedToMember = nodeData.assignedToMemberId === sourceNodeId;
            return isLinkedToUnion || isLinkedToMember;
        }).length;

        const angleStep = sourceNodeId === UNION_NODE_ID ? Math.PI / 4 : Math.PI / 3; 
        const radius = sourceNodeId === UNION_NODE_ID ? 250 + Math.floor(assetNodesLinkedToSource / 6) * 100 : 180 + Math.floor(assetNodesLinkedToSource / 4) * 70;
        
        const sourceNodeX = sourceNodeInstance.position?.x ?? 400;
        const sourceNodeY = sourceNodeInstance.position?.y ?? 100;
        
        let angleStart = Math.PI / 2; 
        if (sourceNodeId === UNION_NODE_ID) {
             angleStart = Math.PI / 2 - ( (assetNodesLinkedToSource > 0 ? assetNodesLinkedToSource -1 : 0) * angleStep / 2);
        } else { 
             angleStart = Math.PI / 2 - ( (assetNodesLinkedToSource > 0 ? assetNodesLinkedToSource -1 : 0) * angleStep / 2);
        }
        const angle = angleStart + (assetNodesLinkedToSource * angleStep) ;

        const newAssetNodeX = sourceNodeX + radius * Math.cos(angle);
        const newAssetNodeY = sourceNodeY + (sourceNodeInstance.height ?? (sourceNodeInstance.type === 'unionNode' ? 100 : 80)) + 50 + radius * Math.sin(angle);

        let nodeDataPayload: ExtendedAssetNodeData;

        if (formData.tipo === 'digital') {
          nodeDataPayload = {
            id: result.assetId!, // ID do ativo principal
            userId: effectiveUser.uid,
            nomeAtivo: formData.nomeAtivo,
            tipo: 'digital',
            quantidadeTotalDigital: formData.quantidadeDigital || 0,
            transactions: [newTransaction],
            assignedToMemberId: processedAssignedToMemberId,
            releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge && memberHasBirthDate(processedAssignedToMemberId) ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
            onOpenDetails: () => {} 
          };
        } else { // fisico
          nodeDataPayload = {
            id: result.assetId!, // ID do ativo principal
            userId: effectiveUser.uid,
            nomeAtivo: formData.nomeAtivo,
            tipo: 'fisico',
            tipoImovelBemFisico: formData.tipoImovelBemFisico!,
            enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico,
            transactions: [newTransaction], // Primeira transação para ativo físico
            assignedToMemberId: processedAssignedToMemberId,
            releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge && memberHasBirthDate(processedAssignedToMemberId) ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
            onOpenDetails: () => {} 
          };
        }
        nodeDataPayload.onOpenDetails = () => handleOpenAssetDetailsModal(nodeDataPayload);

        const newAssetNodeReactFlow: Node<ExtendedAssetNodeData> = {
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
      }
      setIsAssetModalOpen(false);
      setMemberContextForAssetAdd(null);
      setExistingAssetToUpdate(null);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar a transação do ativo.', variant: 'destructive' });
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

      const nodeDataPayload: MemberNodeData = {
        id: result.memberId,
        name: data.nome,
        relationshipType: data.tipoRelacao,
        dataNascimento: data.dataNascimento, 
        onAddAssetClick: (memberId) => handleOpenAssetModalForMember(memberId), // Passando sem assetToUpdate para novo ativo
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
    if (!memberId) return 'Não especificado';
    const member = allMembers.find(m => m.id === memberId);
    return member ? member.nome : 'Membro Desconhecido';
  };


  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height,60px)-1rem)] py-2">
      <Dialog open={isAssetModalOpen} onOpenChange={(isOpen) => {
        setIsAssetModalOpen(isOpen);
        if (!isOpen) {
            setMemberContextForAssetAdd(null); 
            setExistingAssetToUpdate(null);
        }
      }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">
              {existingAssetToUpdate ? `Adicionar Transação para ${existingAssetToUpdate.name}` : "Adicionar Novo Ativo"}
            </DialogTitle>
            <DialogDescription>Preencha os detalhes da aquisição do seu ativo.</DialogDescription>
          </DialogHeader>
          <AssetForm
            onSubmit={handleAddAssetSubmit}
            isLoading={isSubmittingAsset}
            onClose={() => {
                setIsAssetModalOpen(false);
                setMemberContextForAssetAdd(null);
                setExistingAssetToUpdate(null);
            }}
            availableMembers={availableMembersForAssetForm}
            targetMemberId={memberContextForAssetAdd}
            existingAssetToUpdate={existingAssetToUpdate}
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
                  <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData & DigitalAsset).quantidadeTotalDigital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) || 'N/A'}</p>
                </div>
              )}
              {selectedAssetForDetails.tipo === 'fisico' && (
                <>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Tipo de Bem Físico</Label>
                    <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData & PhysicalAsset).tipoImovelBemFisico || 'Não especificado'}</p>
                  </div>
                  {(selectedAssetForDetails as ExtendedAssetNodeData & PhysicalAsset).enderecoLocalizacaoFisico && (
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">Endereço/Localização</Label>
                        <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData & PhysicalAsset).enderecoLocalizacaoFisico}</p>
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
                              <p className="text-foreground">{tx.valorPagoEpoca.toLocaleString(undefined, { style: 'currency', currency: 'BRL' })}</p>
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
          <Controls />
          <Background gap={16} color="hsl(var(--border))" />
        </ReactFlow>
      </div>
    </div>
  );
}

declare module 'reactflow' {
  interface NodeData {
    // UnionNodeData
    id?: string; 
    label?: string;
    onSettingsClick?: () => void;
    onOpenAssetModal?: (assetToUpdate?: {name: string, type: 'digital' | 'fisico', assignedTo?: string | null}) => void; // Atualizado para aceitar assetToUpdate
    onAddMember?: () => void;
    
    // AssetNodeData (agora ExtendedAssetNodeData)
    nomeAtivo?: string; 
    tipo?: 'digital' | 'fisico';
    quantidadeTotalDigital?: number; // Para DigitalAsset
    tipoImovelBemFisico?: string; // Para PhysicalAsset
    enderecoLocalizacaoFisico?: string; // Para PhysicalAsset
    transactions?: AssetTransaction[];
    releaseCondition?: { type: 'age'; targetAge: number };
    assignedToMemberId?: string;
    onOpenDetails?: () => void; 
    observacoesGerais?: string;

    // MemberNodeData
    name?: string; 
    relationshipType?: string;
    dataNascimento?: Date | string;
    onAddAssetClick?: (memberId: string) => void; 
  }
}
