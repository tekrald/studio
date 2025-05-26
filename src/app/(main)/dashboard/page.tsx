
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Network, Settings, DollarSign, Users, PlusCircle, Info, FileText } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData, AssetTransaction } from '@/types/asset';
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


const UNION_NODE_ID = 'union-node';
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

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<UnionNodeData | ExtendedAssetNodeData | MemberNodeData>[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [allMembers, setAllMembers] = useState<MemberWithBirthDate[]>([]);

  const [isContractSettingsModalOpen, setIsContractSettingsModalOpen] = useState(false);
  const [contractClauses, setContractClauses] = useState<ContractClause[]>([]);

  const [isAssetDetailsModalOpen, setIsAssetDetailsModalOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<ExtendedAssetNodeData | null>(null);


  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' } }, eds)),
    [setEdges]
  );

  const handleOpenContractSettings = useCallback(() => {
    // Carregar cláusulas do usuário se existirem, senão usar as padrão
    const userClauses = user?.contractClauses || [
      { id: 'initial-1', text: 'Todos os bens adquiridos durante a união serão divididos igualmente (50/50) em caso de separação.' },
      { id: 'initial-2', text: 'As despesas ordinárias do lar serão custeadas por ambos os cônjuges, na proporção de seus respectivos rendimentos.' },
    ];
    setContractClauses(userClauses);
    setIsContractSettingsModalOpen(true);
  }, [user?.contractClauses]);

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
    displayName: 'Minha União (Mock)',
    email: 'mock@example.com',
    relationshipStructure: '',
    religion: '',
    isWalletConnected: false,
    connectedWalletAddress: null,
    holdingType: '',
    cnpjHolding: '',
    contractClauses: [],
  };


 useEffect(() => {
    const currentUnionNode = nodes.find(node => node.id === UNION_NODE_ID);
    let unionNodeCreatedThisRun = false;

    if (!currentUnionNode && !authLoading && effectiveUser?.displayName) {
      const unionNode: Node<UnionNodeData> = {
        id: UNION_NODE_ID,
        type: 'unionNode',
        position: { x: 400, y: 100 },
        data: {
          label: effectiveUser.displayName || 'Minha União',
          onSettingsClick: handleOpenContractSettings,
          onOpenAssetModal: handleOpenAssetModalForUnion,
          onAddMember: handleOpenAddMemberModal,
        },
        draggable: true,
        nodeOrigin,
      };
      setNodes([unionNode]);
      setEdges([]); // Clear edges when union node is first created
      unionNodeCreatedThisRun = true;
    } else if (currentUnionNode && effectiveUser?.displayName && (currentUnionNode.data as UnionNodeData).label !== effectiveUser.displayName) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === UNION_NODE_ID
            ? { ...node, data: { ...(node.data as UnionNodeData), label: effectiveUser.displayName! } }
            : node
        )
      );
    }

    if (user?.isWalletConnected && (currentUnionNode || unionNodeCreatedThisRun) && !authLoading) {
        const mockDigitalAssetsData: Omit<ExtendedAssetNodeData, 'id' | 'userId' | 'onOpenDetails' | 'assignedToMemberId' | 'releaseCondition'>[] = [
            { nomeAtivo: 'Bitcoin', tipo: 'digital', quantidadeTotalDigital: 0.5, transactions: [{ id: 'tx-btc-1', dataAquisicao: new Date(), quantidadeDigital: 0.5, quemComprou: 'Carteira Conectada'}], isAutoLoaded: true },
            { nomeAtivo: 'Ethereum', tipo: 'digital', quantidadeTotalDigital: 10, transactions: [{ id: 'tx-eth-1', dataAquisicao: new Date(), quantidadeDigital: 10, quemComprou: 'Carteira Conectada'}], isAutoLoaded: true },
        ];

        const nodesToAddThisRun: Node<ExtendedAssetNodeData>[] = [];
        const edgesToAddThisRun: Edge[] = [];

        mockDigitalAssetsData.forEach((mockAsset, index) => {
            const assetId = `mock-${mockAsset.nomeAtivo.toLowerCase().replace(/\s+/g, '-')}`;
            const nodeExists = nodes.some(n => n.id === assetId && !(n.data as ExtendedAssetNodeData).assignedToMemberId); // Check if unassigned asset exists
             if (!nodeExists) {
                const assetDataForDetails: ExtendedAssetNodeData = {
                    id: assetId,
                    userId: effectiveUser.uid,
                    nomeAtivo: mockAsset.nomeAtivo,
                    tipo: 'digital',
                    quantidadeTotalDigital: mockAsset.quantidadeTotalDigital,
                    transactions: mockAsset.transactions || [],
                    isAutoLoaded: mockAsset.isAutoLoaded,
                    onOpenDetails: () => {}
                };
                assetDataForDetails.onOpenDetails = () => handleOpenAssetDetailsModal(assetDataForDetails);

                const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID) || { position: { x: 400, y: 100 }, height: 100, width: 240 };
                const sourceX = unionNodeInstance.position?.x ?? 400;
                const sourceY = unionNodeInstance.position?.y ?? 100;
                const existingUnionDigitalAssetsCount = nodes.filter(n => n.type === 'assetNode' && (n.data as ExtendedAssetNodeData).tipo === 'digital' && !(n.data as ExtendedAssetNodeData).assignedToMemberId).length;

                const angleStep = Math.PI / 6; // Increased density
                const radius = 280 + Math.floor(existingUnionDigitalAssetsCount / 8) * 90; // Slightly larger radius for more space
                // Distribute around the union node, not just below
                const angle = (index * angleStep) + Math.PI / 12;


                nodesToAddThisRun.push({
                    id: assetId, type: 'assetNode', position: { x: sourceX + radius * Math.cos(angle), y: sourceY + radius * Math.sin(angle) }, draggable: true, nodeOrigin,
                    data: assetDataForDetails
                });
                edgesToAddThisRun.push({
                    id: `e-${UNION_NODE_ID}-${assetId}`,
                    source: UNION_NODE_ID,
                    target: assetId,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
                    style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
                });
            }
        });
        
        // Logic for USDC linked to a child
        const firstChildNode = allMembers.find(m => m.tipoRelacao === 'filho_a');
        if (firstChildNode && firstChildNode.id) {
          const childId = firstChildNode.id;
          const usdcAssetId = `mock-usdc-child-${childId}`;
          const usdcNodeExists = nodes.some(n => n.id === usdcAssetId);

          if (!usdcNodeExists) {
            const usdcAssetData: ExtendedAssetNodeData = {
              id: usdcAssetId,
              userId: effectiveUser.uid,
              nomeAtivo: 'USDC Reserva',
              tipo: 'digital',
              quantidadeTotalDigital: 5000,
              transactions: [{ id: `tx-usdc-${childId}`, dataAquisicao: new Date(), quantidadeDigital: 5000, quemComprou: 'Carteira Conectada' }],
              isAutoLoaded: true,
              assignedToMemberId: childId,
              releaseCondition: { type: 'age', targetAge: 18 },
              onOpenDetails: () => {}
            };
            usdcAssetData.onOpenDetails = () => handleOpenAssetDetailsModal(usdcAssetData);
            
            const childNodeInstance = nodes.find(n => n.id === childId);
            if (childNodeInstance) {
                const childNodeX = childNodeInstance.position?.x ?? 0;
                const childNodeY = childNodeInstance.position?.y ?? 0;
                const childAssetsCount = edges.filter(e => e.source === childId).length;

                const angleStepChild = Math.PI / 3; 
                const radiusChild = 180;
                const angleChild = (childAssetsCount * angleStepChild) + Math.PI / 6;


                nodesToAddThisRun.push({
                    id: usdcAssetId, type: 'assetNode', position: { x: childNodeX + radiusChild * Math.cos(angleChild), y: childNodeY + radiusChild * Math.sin(angleChild) }, draggable: true, nodeOrigin,
                    data: usdcAssetData
                });
                edgesToAddThisRun.push({
                    id: `e-${childId}-${usdcAssetId}`,
                    source: childId,
                    target: usdcAssetId,
                    type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
                    style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
                });
            }
          }
        }


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
  }, [authLoading, effectiveUser?.displayName, user?.isWalletConnected, user?.uid, allMembers, nodes, setNodes, setEdges, handleOpenContractSettings, handleOpenAssetModalForUnion, handleOpenAddMemberModal]);


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
    // For physical assets, `tipoAtivoDigital` will be undefined.
    const result = await addAsset(formData, effectiveUser.uid); 

    if (result.success && result.assetId && result.transactionId) {
      toast({ title: 'Sucesso!', description: 'Ativo físico adicionado com sucesso.' });
      
      const newTransaction: AssetTransaction = {
        id: result.transactionId,
        dataAquisicao: formData.dataAquisicao,
        quemComprou: formData.quemComprou === "UNSPECIFIED_BUYER" || !formData.quemComprou ? "Entidade Principal" : formData.quemComprou,
        contribuicaoParceiro1: formData.contribuicaoParceiro1,
        contribuicaoParceiro2: formData.contribuicaoParceiro2,
        observacoes: formData.observacoes,
        tipoImovelBemFisico: formData.tipoImovelBemFisico, // Specific to physical asset transaction
        enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico, // Specific to physical asset transaction
      };
      
      const processedAssignedToMemberId = memberContextForAssetAdd || (formData.assignedToMemberId === "UNASSIGNED" ? undefined : formData.assignedToMemberId);
      
      const sourceNodeId = processedAssignedToMemberId || UNION_NODE_ID;
      const sourceNodeInstance = nodes.find(n => n.id === sourceNodeId);

      if (!sourceNodeInstance) {
        console.error("Nó de origem (União Principal ou Membro) não encontrado.", sourceNodeId);
        setIsSubmittingAsset(false);
        setMemberContextForAssetAdd(null);
        return;
      }

      const assetNodesLinkedToSource = edges.filter(e => e.source === sourceNodeId && nodes.find(n => n.id === e.target && n.type === 'assetNode')).length;


      const angleStep = sourceNodeId === UNION_NODE_ID ? Math.PI / 6 : Math.PI / 4;
      const radius = sourceNodeId === UNION_NODE_ID ? 280 + Math.floor(assetNodesLinkedToSource / 8) * 90 : 180 + Math.floor(assetNodesLinkedToSource / 6) * 80;
      const sourceNodeX = sourceNodeInstance.position?.x ?? 400;
      const sourceNodeY = sourceNodeInstance.position?.y ?? 100;
      
      let angleStart;
      if (sourceNodeId === UNION_NODE_ID) { 
          angleStart = (Math.PI * 1.75) - ((Math.max(0, assetNodesLinkedToSource -1)) * angleStep / 2) ; 
      } else { 
          angleStart = (Math.PI * 0.15) - ((Math.max(0, assetNodesLinkedToSource -1)) * angleStep / 2) ; 
      }
      const angle = angleStart + (assetNodesLinkedToSource * angleStep) ;

      const newAssetNodeX = sourceNodeX + radius * Math.cos(angle);
      const newAssetNodeY = sourceNodeY + radius * Math.sin(angle);
      
      const nodeDataPayload: ExtendedAssetNodeData = {
          id: result.assetId!,
          userId: effectiveUser.uid,
          nomeAtivo: formData.nomeAtivo,
          tipo: 'fisico', // Explicitly physical for this form
          tipoImovelBemFisico: formData.tipoImovelBemFisico,
          enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico,
          transactions: [newTransaction],
          observacoes: formData.observacoes, // Observação geral do ativo, pode ser a mesma da primeira transação
          assignedToMemberId: processedAssignedToMemberId,
          releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge && memberHasBirthDate(processedAssignedToMemberId) ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
          isAutoLoaded: false,
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
    const result = await addMember(data, UNION_NODE_ID); // UNION_NODE_ID is the unionId
    if (result.success && result.memberId) {
      toast({ title: 'Sucesso!', description: 'Filho(a) adicionado com sucesso.' });

       const newMember: MemberWithBirthDate = {
        id: result.memberId,
        unionId: UNION_NODE_ID,
        nome: data.nome,
        tipoRelacao: data.tipoRelacao, 
        dataNascimento: data.dataNascimento,
      };
      setAllMembers(prev => [...prev, newMember]); // Add to allMembers for future reference

      const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID);
      if (!unionNodeInstance) {
        setIsSubmittingMember(false);
        return;
      }

      const memberNodesCount = nodes.filter(n => n.type === 'memberNode').length;
      const angleStep = Math.PI / 6; // Increased density
      const radius = 280 + Math.floor(memberNodesCount / 8) * 90; // Slightly larger radius
      const unionNodeX = unionNodeInstance.position?.x ?? 400;
      const unionNodeY = unionNodeInstance.position?.y ?? 100;
      
      const angleStart = (Math.PI * 0.25) - ((Math.max(0, memberNodesCount -1)) * angleStep / 2); // Start slightly to the side
      const angle = angleStart + (memberNodesCount * angleStep);

      const newMemberNodeX = unionNodeX + radius * Math.cos(angle);
      const newMemberNodeY = unionNodeY + radius * Math.sin(angle);

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
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o filho(a).', variant: 'destructive' });
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
    if (!memberId || memberId === "Entidade Principal" || memberId === "Carteira Conectada") return 'União Principal (Ipê Acta)';
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Adicionar Novo Ativo Físico</DialogTitle>
            <DialogDescription className="text-muted-foreground">Preencha os detalhes do seu ativo físico.</DialogDescription>
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
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Adicionar Novo Filho(a)</DialogTitle>
            <DialogDescription className="text-muted-foreground">Insira os dados do novo filho(a) da sua união.</DialogDescription>
          </DialogHeader>
          <AddMemberForm onSubmit={handleAddMemberSubmit} isLoading={isSubmittingMember} onClose={() => setIsAddMemberModalOpen(false)} />
        </DialogContent>
      </Dialog>

       <Dialog open={isAssetDetailsModalOpen} onOpenChange={handleCloseAssetDetailsModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Detalhes do Ativo: {selectedAssetForDetails?.nomeAtivo}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
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
              {selectedAssetForDetails.observacoes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Observações Gerais do Ativo</Label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedAssetForDetails.observacoes}</p>
                </div>
              )}
              {selectedAssetForDetails.isAutoLoaded && (
                 <div className="flex items-center space-x-1 text-xs text-accent pt-1">
                    <Info size={14} />
                    <span>Carregado automaticamente da carteira conectada (simulado).</span>
                </div>
              )}


              <div className="space-y-3 pt-3 mt-3 border-t border-border/50">
                <h4 className="text-md font-semibold text-primary">Histórico de Aquisições/Transações</h4>
                 {selectedAssetForDetails.transactions && selectedAssetForDetails.transactions.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                    {selectedAssetForDetails.transactions.map((tx, index) => (
                      <Card key={tx.id || index} className="p-3 bg-muted/50 border-border/30">
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
                              <p className="text-foreground">{tx.quemComprou === "Entidade Principal" ? "União Principal (Ipê Acta)" : tx.quemComprou === "Carteira Conectada" ? "Carteira Conectada (Simulado)" : getMemberNameById(tx.quemComprou)}</p>
                            </div>
                          )}
                          {tx.quemComprou === 'Ambos' && effectiveUser?.displayName && (
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
                          <div className="mt-2 pt-2 border-t border-dashed border-border/30">
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
                    Nota: A "Quantidade Total" do ativo reflete a soma de todas as transações. Os detalhes de "Observações Gerais" e "Designado para" são referentes ao ativo como um todo. Consulte o histórico para detalhes de cada aquisição.
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
        dialogTitle="Configurações dos Acordos do Registro"
        dialogDescription="Adicione, visualize, edite e gerencie as cláusulas dos seus acordos. Lembre-se que o Ipê Acta é uma ferramenta de planejamento e não substitui aconselhamento jurídico."
      />

      <div className="flex-grow shadow-lg relative overflow-hidden rounded-md border-2 border-dashed border-border bg-background">
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
  interface NodeData {
    id?: string;
    label?: string; // For default React Flow nodes, can be used by custom nodes too
    
    // For UnionNode
    onSettingsClick?: () => void;
    onOpenAssetModal?: () => void;
    onAddMember?: () => void;
    
    // For MemberNode
    name?: string; 
    relationshipType?: string; 
    onAddAssetClick?: (memberId: string) => void; 
    
    // For AssetNode (ExtendedAssetNodeData)
    userId?: string;
    nomeAtivo?: string;
    tipo?: 'digital' | 'fisico';
    quantidadeTotalDigital?: number;
    tipoImovelBemFisico?: string;
    enderecoLocalizacaoFisico?: string;
    transactions?: AssetTransaction[];
    assignedToMemberId?: string;
    releaseCondition?: { type: 'age'; targetAge: number };
    observacoes?: string;
    isAutoLoaded?: boolean;
    onOpenDetails?: () => void;
  }
}
