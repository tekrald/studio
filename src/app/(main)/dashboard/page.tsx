
"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Users, Settings, FileText, Briefcase, DollarSign, Network, LayoutGrid } from 'lucide-react'; // Removed Canvas, Plus. Added LayoutGrid
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData, ExtendedAssetNodeData, AssetTransaction } from '@/types/asset';
import { addAsset } from '@/actions/assetActions';
import { AddMemberForm } from '@/components/members/AddMemberForm';
import type { MemberFormData, Member } from '@/types/member';
import { addMember } from '@/actions/memberActions';
import { AssetReleaseDialog } from '@/components/assets/AssetReleaseDialog';

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
import { AssetNode } from '@/components/nodes/AssetNode';
import { MemberNode, type MemberNodeData } from '@/components/nodes/MemberNode';
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Label } from '@/components/ui/label';


const UNION_NODE_ID = 'union-node';
const nodeOrigin: NodeOrigin = [0.5, 0.5];

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export interface MemberWithBirthDate extends Member {
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
  const [existingAssetToUpdate, setExistingAssetToUpdate] = useState<ExtendedAssetNodeData | null>(null);


  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<UnionNodeData | ExtendedAssetNodeData | MemberNodeData>[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [allMembers, setAllMembers] = useState<MemberWithBirthDate[]>([]); // Stores full member data including birthdate

  const [isContractSettingsModalOpen, setIsContractSettingsModalOpen] = useState(false);
  const [contractClauses, setContractClauses] = useState<ContractClause[]>([]);

  const [isAssetDetailsModalOpen, setIsAssetDetailsModalOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<ExtendedAssetNodeData | null>(null);

  const [isAssetReleaseModalOpen, setIsAssetReleaseModalOpen] = useState(false);
  const [selectedAssetForReleaseManagement, setSelectedAssetForReleaseManagement] = useState<ExtendedAssetNodeData | null>(null);
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' } }, eds)),
    [setEdges]
  );

  const handleOpenContractSettings = useCallback(() => {
    const userClauses = user?.contractClauses || [
      { id: 'initial-1', text: 'All assets acquired during the union will be divided equally (50/50) in case of separation.' },
      { id: 'initial-2', text: 'Ordinary household expenses will be borne by both spouses, in proportion to their respective incomes.' },
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
    toast({ title: 'Clause Added', description: 'New clause saved to the agreements.' });
  };

  const handleRemoveClause = (id: string) => {
    setContractClauses(prev => prev.filter(clause => clause.id !== id));
    toast({ title: 'Clause Removed', description: 'The clause has been removed from the agreements.' });
  };

  const handleUpdateContractClause = (id: string, newText: string) => {
    setContractClauses(prev => prev.map(clause => clause.id === id ? { ...clause, text: newText } : clause));
    toast({ title: 'Clause Updated', description: 'The clause has been successfully modified.' });
  };

  const handleOpenAssetModalForUnion = useCallback(() => {
    setExistingAssetToUpdate(null);
    setMemberContextForAssetAdd(null);
    setIsAssetModalOpen(true);
  }, []);

  const handleOpenAssetModalForMember = useCallback((memberId: string) => {
    setExistingAssetToUpdate(null); // For now, adding asset from member is always "new"
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

  const handleOpenReleaseDialog = useCallback((assetData: ExtendedAssetNodeData) => {
    setSelectedAssetForReleaseManagement(assetData);
    setIsAssetReleaseModalOpen(true);
  }, []);

  const handleCloseReleaseDialog = useCallback(() => {
    setIsAssetReleaseModalOpen(false);
    setSelectedAssetForReleaseManagement(null);
  }, []);

  const handleSaveAssetReleaseCondition = useCallback(async (assetId: string, targetAge: number | undefined) => {
    setIsSubmittingRelease(true);
    // Simulate saving to backend/state
    await new Promise(resolve => setTimeout(resolve, 500));

    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === assetId && node.type === 'assetNode') {
          const updatedData = { ...node.data as ExtendedAssetNodeData };
          if (targetAge !== undefined) {
            updatedData.releaseCondition = { type: 'age', targetAge };
          } else {
            delete updatedData.releaseCondition;
          }
          return { ...node, data: updatedData };
        }
        return node;
      })
    );
    setIsSubmittingRelease(false);
    handleCloseReleaseDialog();
    toast({
      title: 'Release Condition Updated',
      description: targetAge ? `Release age set to ${targetAge}.` : 'Release condition removed.',
    });
  }, [setNodes, handleCloseReleaseDialog, toast]);


  const effectiveUser = user || {
    uid: 'mock-uid-default',
    displayName: 'My Union (Mock)',
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
      const unionNodeData: UnionNodeData = {
        label: effectiveUser.displayName || 'My Union',
        onSettingsClick: handleOpenContractSettings,
        onOpenAssetModal: handleOpenAssetModalForUnion, // This will add a PHYSICAL asset to the union
        onAddMember: handleOpenAddMemberModal,
      };
      const unionNodeReactFlow: Node<UnionNodeData> = {
        id: UNION_NODE_ID,
        type: 'unionNode',
        position: { x: 400, y: 100 },
        data: unionNodeData,
        draggable: true,
        nodeOrigin,
      };
      setNodes([unionNodeReactFlow]);
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
        const mockDigitalAssets: Omit<ExtendedAssetNodeData, 'id' | 'userId' | 'onOpenDetails' | 'onOpenReleaseDialog' | 'assignedToMemberId' | 'releaseCondition' | 'tipoImovelBemFisico' | 'enderecoLocalizacaoFisico' | 'observacoes' | 'tipo'>[] = [
            { nomeAtivo: 'Bitcoin', transactions: [{ id: 'tx-btc-1', dataAquisicao: new Date(), quantidadeDigital: 0.5, quemComprou: 'Connected Wallet'}], quantidadeTotalDigital: 0.5, isAutoLoaded: true },
            { nomeAtivo: 'Ethereum', transactions: [{ id: 'tx-eth-1', dataAquisicao: new Date(), quantidadeDigital: 10, quemComprou: 'Connected Wallet'}], quantidadeTotalDigital: 10, isAutoLoaded: true },
        ];

        const nodesToAddThisRun: Node<ExtendedAssetNodeData>[] = [];
        const edgesToAddThisRun: Edge[] = [];

        mockDigitalAssets.forEach((mockAsset, index) => {
            const assetId = `mock-asset-${mockAsset.nomeAtivo.toLowerCase().replace(/\s+/g, '-')}-union`;
            const nodeExists = nodes.some(n => n.id === assetId && n.type === 'assetNode' && !(n.data as ExtendedAssetNodeData).assignedToMemberId);
             if (!nodeExists) {
                const assetDataForNode: ExtendedAssetNodeData = {
                    id: assetId,
                    userId: effectiveUser.uid,
                    nomeAtivo: mockAsset.nomeAtivo,
                    tipo: 'digital', // All mock assets from wallet are digital
                    quantidadeTotalDigital: mockAsset.quantidadeTotalDigital,
                    transactions: mockAsset.transactions || [],
                    isAutoLoaded: mockAsset.isAutoLoaded,
                    observacoes: `Asset ${mockAsset.nomeAtivo} automatically loaded.`,
                    onOpenDetails: () => {}, // Placeholder, will be set below
                    onOpenReleaseDialog: () => {}, // Placeholder
                };
                assetDataForNode.onOpenDetails = () => handleOpenAssetDetailsModal(assetDataForNode);
                assetDataForNode.onOpenReleaseDialog = (ad) => handleOpenReleaseDialog(ad);


                const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID) || { position: { x: 400, y: 100 }, height: 100, width: 240 };
                const sourceX = unionNodeInstance.position?.x ?? 400;
                const sourceY = unionNodeInstance.position?.y ?? 100;
                const existingUnionDigitalAssetsCount = nodes.filter(n => n.type === 'assetNode' && (n.data as ExtendedAssetNodeData).tipo === 'digital' && !(n.data as ExtendedAssetNodeData).assignedToMemberId).length;

                const angleStep = Math.PI / 6;
                const radius = 280 + Math.floor(existingUnionDigitalAssetsCount / 8) * 90;
                const angle = (existingUnionDigitalAssetsCount * angleStep) + Math.PI / 12; // Offset slightly from members


                nodesToAddThisRun.push({
                    id: assetId, type: 'assetNode', position: { x: sourceX + radius * Math.cos(angle), y: sourceY + radius * Math.sin(angle) }, draggable: true, nodeOrigin,
                    data: assetDataForNode
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

        const firstChildNode = allMembers.find(m => m.tipoRelacao === 'filho_a');
        if (firstChildNode && firstChildNode.id) {
          const childId = firstChildNode.id;
          const usdcAssetId = `mock-usdc-child-${childId}`;
          const usdcNodeExists = nodes.some(n => n.id === usdcAssetId);

          if (!usdcNodeExists) {
            const usdcAssetData: ExtendedAssetNodeData = {
              id: usdcAssetId,
              userId: effectiveUser.uid,
              nomeAtivo: 'USDC Reserve',
              tipo: 'digital',
              quantidadeTotalDigital: 5000,
              transactions: [{ id: `tx-usdc-${childId}`, dataAquisicao: new Date(), quantidadeDigital: 5000, quemComprou: 'Connected Wallet' }],
              isAutoLoaded: true,
              assignedToMemberId: childId,
              releaseCondition: { type: 'age', targetAge: 18 },
              observacoes: "USDC Reserve for the child.",
              onOpenDetails: () => {},
              onOpenReleaseDialog: () => {},
            };
            usdcAssetData.onOpenDetails = () => handleOpenAssetDetailsModal(usdcAssetData);
            usdcAssetData.onOpenReleaseDialog = (ad) => handleOpenReleaseDialog(ad);

            const childNodeInstance = nodes.find(n => n.id === childId);
            if (childNodeInstance) {
                const childNodeX = childNodeInstance.position?.x ?? 0;
                const childNodeY = childNodeInstance.position?.y ?? 0;
                const childAssetsCount = edges.filter(e => e.source === childId && nodes.find(n => n.id === e.target && n.type === 'assetNode')).length;

                const angleStepChild = Math.PI / 3;
                const radiusChild = 180 + Math.floor(childAssetsCount / 6) * 80;
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
  }, [authLoading, effectiveUser?.displayName, user?.isWalletConnected, user?.uid, allMembers.length, setNodes, setEdges, handleOpenContractSettings, handleOpenAssetModalForUnion, handleOpenAddMemberModal, handleOpenReleaseDialog]);


  const memberHasBirthDate = (memberId?: string): boolean => {
    if (!memberId) return false;
    const member = allMembers.find(m => m.id === memberId);
    return !!member?.dataNascimento;
  };

  const handleAddAssetSubmit = async (formData: AssetFormData) => {
    if (!effectiveUser) {
        toast({ title: 'Error!', description: 'User not authenticated.', variant: 'destructive' });
        return;
    }
    setIsSubmittingAsset(true);

    const result = await addAsset(formData, effectiveUser.uid); // This is for PHYSICAL assets

    if (result.success && result.assetId && result.transactionId) {
        toast({ title: 'Success!', description: 'Physical asset added successfully.' });

        const newTransaction: AssetTransaction = {
            id: result.transactionId,
            dataAquisicao: formData.dataAquisicao,
            quemComprou: formData.quemComprou === "UNSPECIFIED_BUYER" || !formData.quemComprou ? "Main Entity" : formData.quemComprou,
            contribuicaoParceiro1: formData.contribuicaoParceiro1,
            contribuicaoParceiro2: formData.contribuicaoParceiro2,
            observacoes: formData.observacoes,
            tipoImovelBemFisico: formData.tipoImovelBemFisico,
            enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico,
        };

        const processedAssignedToMemberId = memberContextForAssetAdd || (formData.assignedToMemberId === "UNASSIGNED" ? undefined : formData.assignedToMemberId);
        const sourceNodeId = processedAssignedToMemberId || UNION_NODE_ID;
        const sourceNodeInstance = nodes.find(n => n.id === sourceNodeId);

        if (!sourceNodeInstance) {
            console.error("Source node (Union or Member) not found for physical asset.", sourceNodeId);
            setIsSubmittingAsset(false);
            setMemberContextForAssetAdd(null);
            return;
        }

        const nodeDataPayload: ExtendedAssetNodeData = {
            id: result.assetId,
            userId: effectiveUser.uid,
            nomeAtivo: formData.nomeAtivo,
            tipo: 'fisico',
            tipoImovelBemFisico: formData.tipoImovelBemFisico,
            enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico,
            transactions: [newTransaction],
            observacoes: formData.observacoes, // General asset observation
            assignedToMemberId: processedAssignedToMemberId,
            releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge && memberHasBirthDate(processedAssignedToMemberId) ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
            isAutoLoaded: false,
            onOpenDetails: () => {},
            onOpenReleaseDialog: () => {},
        };
        nodeDataPayload.onOpenDetails = () => handleOpenAssetDetailsModal(nodeDataPayload);
        nodeDataPayload.onOpenReleaseDialog = (ad) => handleOpenReleaseDialog(ad);


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

        const newAssetNodeReactFlow: Node<ExtendedAssetNodeData> = {
            id: result.assetId,
            type: 'assetNode',
            data: nodeDataPayload,
            position: { x: sourceNodeX + radius * Math.cos(angle), y: sourceNodeY + radius * Math.sin(angle) },
            draggable: true,
            nodeOrigin,
        };

        setNodes((prevNodes) => prevNodes.concat(newAssetNodeReactFlow));
        setEdges((prevEdges) => prevEdges.concat({
            id: `e-${sourceNodeId}-${result.assetId!}`,
            source: sourceNodeId,
            target: result.assetId!,
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
        }));

        setIsAssetModalOpen(false);
        setMemberContextForAssetAdd(null);
    } else {
        toast({ title: 'Error!', description: result.error || 'Could not add physical asset.', variant: 'destructive' });
    }
    setIsSubmittingAsset(false);
  };


  const handleAddMemberSubmit = async (data: MemberFormData) => {
    if (!effectiveUser) {
      toast({ title: 'Error!', description: 'User not authenticated.', variant: 'destructive' });
      return;
    }
    setIsSubmittingMember(true);
    const result = await addMember(data, UNION_NODE_ID);
    if (result.success && result.memberId) {
      toast({ title: 'Success!', description: 'Child added successfully.' });

       const newMemberData: MemberWithBirthDate = {
        id: result.memberId,
        unionId: UNION_NODE_ID,
        nome: data.nome,
        tipoRelacao: data.tipoRelacao,
        dataNascimento: data.dataNascimento,
      };
      setAllMembers(prev => [...prev, newMemberData]);

      const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID);
      if (!unionNodeInstance) {
        setIsSubmittingMember(false);
        return;
      }

      const memberNodesCount = nodes.filter(n => n.type === 'memberNode').length;
      const angleStep = Math.PI / 6;
      const radius = 280 + Math.floor(memberNodesCount / 8) * 90;
      const unionNodeX = unionNodeInstance.position?.x ?? 400;
      const unionNodeY = unionNodeInstance.position?.y ?? 100;

      const angleStart = (Math.PI * 0.25) - ((Math.max(0, memberNodesCount -1)) * angleStep / 2);
      const angle = angleStart + (memberNodesCount * angleStep);

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
        position: { x: unionNodeX + radius * Math.cos(angle), y: unionNodeY + radius * Math.sin(angle) },
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
      toast({ title: 'Error!', description: result.error || 'Could not add child.', variant: 'destructive' });
    }
    setIsSubmittingMember(false);
  };

  const availableMembersForAssetForm = useMemo(() => allMembers.map(member => ({
      id: member.id!,
      name: member.nome,
      birthDate: member.dataNascimento,
    })), [allMembers]);

  const selectedMemberForReleaseDialog = useMemo(() => {
    if (selectedAssetForReleaseManagement?.assignedToMemberId) {
      return allMembers.find(m => m.id === selectedAssetForReleaseManagement.assignedToMemberId) || null;
    }
    return null;
  }, [selectedAssetForReleaseManagement, allMembers]);


  if (authLoading && !nodes.find(n => n.id === UNION_NODE_ID)) {
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,60px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getMemberNameById = (memberId?: string) => {
    if (!memberId || memberId === "Main Entity" || memberId === "Connected Wallet") return 'Main Union (Ipê Acta)';
    const member = allMembers.find(m => m.id === memberId);
    return member ? member.nome : 'Unknown Member';
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Add New Physical Asset</DialogTitle>
            <DialogDescription className="text-muted-foreground">Fill in the details of your physical asset.</DialogDescription>
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
            user={user}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Add New Child</DialogTitle>
            <DialogDescription className="text-muted-foreground">Enter the details of the new child in your union.</DialogDescription>
          </DialogHeader>
          <AddMemberForm onSubmit={handleAddMemberSubmit} isLoading={isSubmittingMember} onClose={() => setIsAddMemberModalOpen(false)} />
        </DialogContent>
      </Dialog>

       <Dialog open={isAssetDetailsModalOpen} onOpenChange={handleCloseAssetDetailsModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Asset Details: {selectedAssetForDetails?.nomeAtivo}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Information about the asset and acquisition history.
            </DialogDescription>
          </DialogHeader>
          {selectedAssetForDetails && (
            <div className="space-y-4 py-4 text-sm">
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Asset Name</Label>
                <p className="font-semibold text-foreground">{selectedAssetForDetails.nomeAtivo}</p>
              </div>
              <div>
                <Label className="text-xs font-medium text-muted-foreground">Main Type</Label>
                <p className="text-foreground capitalize">{selectedAssetForDetails.tipo}</p>
              </div>

              {selectedAssetForDetails.tipo === 'digital' && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Total Quantity</Label>
                  <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData).quantidadeTotalDigital?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }) || 'N/A'}</p>
                </div>
              )}
              {selectedAssetForDetails.tipo === 'fisico' && (
                <>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Type of Physical Good</Label>
                    <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData).tipoImovelBemFisico || 'Not specified'}</p>
                  </div>
                  {(selectedAssetForDetails as ExtendedAssetNodeData).enderecoLocalizacaoFisico && (
                    <div>
                        <Label className="text-xs font-medium text-muted-foreground">Address/Location</Label>
                        <p className="text-foreground">{(selectedAssetForDetails as ExtendedAssetNodeData).enderecoLocalizacaoFisico}</p>
                    </div>
                  )}
                </>
              )}

              {selectedAssetForDetails.assignedToMemberId && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Assigned to</Label>
                  <p className="text-foreground">{getMemberNameById(selectedAssetForDetails.assignedToMemberId)}</p>
                </div>
              )}
              {selectedAssetForDetails.releaseCondition?.type === 'age' && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">Release Condition</Label>
                  <p className="text-foreground">Release at {selectedAssetForDetails.releaseCondition.targetAge} years old</p>
                </div>
              )}
              {selectedAssetForDetails.observacoes && (
                <div>
                  <Label className="text-xs font-medium text-muted-foreground">General Asset Notes</Label>
                  <p className="text-foreground whitespace-pre-wrap">{selectedAssetForDetails.observacoes}</p>
                </div>
              )}
              {selectedAssetForDetails.isAutoLoaded && (
                 <div className="flex items-center space-x-1 text-xs text-accent pt-1">
                    <LayoutGrid size={14} /> {/* Changed from Info to LayoutGrid as per previous changes */}
                    <span>Automatically loaded from connected wallet (simulated).</span>
                </div>
              )}


              <div className="space-y-3 pt-3 mt-3 border-t border-border/50">
                <h4 className="text-md font-semibold text-primary">Acquisition/Transaction History</h4>
                 {selectedAssetForDetails.transactions && selectedAssetForDetails.transactions.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                    {selectedAssetForDetails.transactions.map((tx, index) => (
                      <Card key={tx.id || index} className="p-3 bg-muted/50 border-border/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                          <div>
                            <Label className="text-xs font-medium text-muted-foreground">Acquisition Date</Label>
                            <p className="text-foreground">{format(new Date(tx.dataAquisicao), "MM/dd/yyyy 'at' HH:mm", { locale: enUS })}</p>
                          </div>
                          {tx.quantidadeDigital !== undefined && selectedAssetForDetails.tipo === 'digital' && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Quantity Acquired</Label>
                              <p className="text-foreground">{tx.quantidadeDigital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</p>
                            </div>
                          )}
                          {tx.valorPagoEpoca !== undefined && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Value Paid at the Time</Label>
                              <p className="text-foreground">{typeof tx.valorPagoEpoca === 'number' ? tx.valorPagoEpoca.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : tx.valorPagoEpoca}</p>
                            </div>
                          )}
                           {tx.quemComprou && (
                            <div>
                              <Label className="text-xs font-medium text-muted-foreground">Acquired by</Label>
                              <p className="text-foreground">{tx.quemComprou === "Main Entity" ? "Main Union (Ipê Acta)" : tx.quemComprou === "Connected Wallet" ? "Connected Wallet (Simulated)" : getMemberNameById(tx.quemComprou)}</p>
                            </div>
                          )}
                          {tx.quemComprou === 'Ambos' && effectiveUser?.displayName && ( // Assuming "Ambos" means both partners
                            <>
                              {tx.contribuicaoParceiro1 !== undefined && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Contrib. ({effectiveUser.displayName.split('&')[0]?.trim() || 'Partner 1'})</Label>
                                  <p className="text-foreground">{tx.contribuicaoParceiro1.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</p>
                                </div>
                              )}
                              {tx.contribuicaoParceiro2 !== undefined && (
                                <div>
                                  <Label className="text-xs font-medium text-muted-foreground">Contrib. ({effectiveUser.displayName.split('&')[1]?.trim() || 'Partner 2'})</Label>
                                  <p className="text-foreground">{tx.contribuicaoParceiro2.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                        {tx.observacoes && (
                          <div className="mt-2 pt-2 border-t border-dashed border-border/30">
                            <Label className="text-xs font-medium text-muted-foreground">Transaction Notes</Label>
                            <p className="text-foreground whitespace-pre-wrap text-xs">{tx.observacoes}</p>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No transactions recorded for this asset.</p>
                )}
                 {selectedAssetForDetails.tipo === 'digital' && selectedAssetForDetails.transactions && selectedAssetForDetails.transactions.length > 1 &&(
                   <CardDescription className="text-xs text-muted-foreground mt-2">
                    Note: The "Total Quantity" of the asset reflects the sum of all transactions. General notes and assignment refer to the asset as a whole. Refer to the history for details of each acquisition.
                  </CardDescription>
                )}
              </div>

              <div className="pt-4">
                <Button onClick={handleCloseAssetDetailsModal} className="w-full" variant="outline">Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AssetReleaseDialog
        isOpen={isAssetReleaseModalOpen}
        onClose={handleCloseReleaseDialog}
        asset={selectedAssetForReleaseManagement}
        assignedMember={selectedMemberForReleaseDialog}
        onSaveReleaseCondition={handleSaveAssetReleaseCondition}
        isLoading={isSubmittingRelease}
      />


      <ContractSettingsDialog
        isOpen={isContractSettingsModalOpen}
        onClose={() => setIsContractSettingsModalOpen(false)}
        clauses={contractClauses}
        onAddClause={handleAddContractClause}
        onRemoveClause={handleRemoveClause}
        onUpdateClause={handleUpdateContractClause}
        dialogTitle="Contract Agreement Settings"
        dialogDescription="Add, view, edit, and manage the clauses of your agreements. Remember that Ipê Acta is a planning tool and does not replace legal advice."
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
      <div className="mt-6 flex justify-center gap-4">
        <Button
            variant="outline"
            onClick={() => toast({ title: "Coming Soon!", description: "Functionality to generate marriage certificate will be implemented."})}
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
        >
            <FileText className="mr-2 h-5 w-5" />
            Generate Marriage Certificate
        </Button>
        <Button
            variant="outline"
            onClick={() => toast({ title: "Coming Soon!", description: "Functionality to generate holding report will be implemented."})}
            className="border-accent text-accent hover:bg-accent/10 hover:text-accent"
        >
            <Briefcase className="mr-2 h-5 w-5" />
            Holding Report
        </Button>
      </div>
    </div>
  );
}

// Augment React Flow's NodeData type
declare module 'reactflow' {
  interface NodeData {
    // Common to all node types for easier access in generic functions
    id?: string;

    // For UnionNode (UnionNodeData from UnionNode.tsx)
    label?: string;
    onSettingsClick?: () => void;
    onOpenAssetModal?: () => void;
    onAddMember?: () => void;

    // For MemberNode (MemberNodeData from MemberNode.tsx)
    name?: string;
    relationshipType?: string;
    onAddAssetClick?: (memberId: string) => void;

    // For AssetNode (ExtendedAssetNodeData from types/asset.ts)
    userId?: string;
    nomeAtivo?: string;
    tipo?: 'digital' | 'fisico';
    quantidadeTotalDigital?: number;
    tipoImovelBemFisico?: string;
    enderecoLocalizacaoFisico?: string;
    transactions?: AssetTransaction[];
    assignedToMemberId?: string;
    releaseCondition?: { type: 'age'; targetAge: number };
    observacoes?: string; // General asset notes
    isAutoLoaded?: boolean;
    onOpenDetails?: () => void;
    onOpenReleaseDialog?: (assetData: ExtendedAssetNodeData) => void;
  }
}
