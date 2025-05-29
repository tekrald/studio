
"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Users, Settings, FileText, Briefcase, Network, DollarSign, LayoutGrid, HomeIcon, Clock, User as UserIcon } from 'lucide-react';
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
import { MemberNode, type MemberNodeData as IMemberNodeData } from '@/components/nodes/MemberNode';
import { PartnerNode, type PartnerNodeData as IPartnerNodeData } from '@/components/nodes/PartnerNode';
import { ContractSettingsDialog, type ContractClause } from '@/components/contract/ContractSettingsDialog';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Label } from '@/components/ui/label';

const UNION_NODE_ID = 'union-node';
const nodeOrigin: NodeOrigin = [0.5, 0.5];

// Layout constants
const UNION_NODE_X_POS = 600;
const UNION_NODE_Y_POS = 100;
const NODE_WIDTH = 224;
const HORIZONTAL_SPACING = 40;

const PARTNER_ROW_Y_OFFSET = 180;
const CHILDREN_ROW_Y_OFFSET = 180;
const ASSET_ROW_Y_OFFSET = 180;


const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

export interface MemberWithBirthDate extends Member {
  dataNascimento?: Date | string;
}

export interface MemberWithBirthDateAndWallet extends MemberWithBirthDate {
  walletAddress?: string;
}

export interface ExtendedMemberNodeData extends IMemberNodeData {
  walletAddress?: string;
  onAddAssetClick: (memberId: string) => void;
}

// Re-exporting PartnerNodeData for clarity, assuming it's defined in PartnerNode.tsx
export type PartnerNodeData = IPartnerNodeData;


export interface GeneratedCertificate {
  id: string;
  dateGenerated: Date;
  clausesSnapshot: ContractClause[];
  unionName: string;
}

const nodeTypes = {
  unionNode: UnionNode,
  assetNode: AssetNode,
  memberNode: MemberNode,
  partnerNode: PartnerNode,
};

export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [memberContextForAssetAdd, setMemberContextForAssetAdd] = useState<string | null>(null);

  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node<UnionNodeData | ExtendedAssetNodeData | ExtendedMemberNodeData | PartnerNodeData>[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [allMembers, setAllMembers] = useState<MemberWithBirthDateAndWallet[]>([]);

  const [isContractSettingsModalOpen, setIsContractSettingsModalOpen] = useState(false);
  const [contractClauses, setContractClauses] = useState<ContractClause[]>([
    { id: 'initial-1', text: "All assets acquired during the union will be divided equally (50/50) in case of separation." },
    { id: 'initial-2', text: "Ordinary household expenses will be borne by both spouses, in proportion to their respective incomes." },
  ]);

  const [isAssetDetailsModalOpen, setIsAssetDetailsModalOpen] = useState(false);
  const [selectedAssetForDetails, setSelectedAssetForDetails] = useState<ExtendedAssetNodeData | null>(null);

  const [isAssetReleaseModalOpen, setIsAssetReleaseModalOpen] = useState(false);
  const [selectedAssetForReleaseManagement, setSelectedAssetForReleaseManagement] = useState<ExtendedAssetNodeData | null>(null);
  const [isSubmittingRelease, setIsSubmittingRelease] = useState(false);

  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [generatedCertificates, setGeneratedCertificates] = useState<GeneratedCertificate[]>([]);
  const [isHoldingReportModalOpen, setIsHoldingReportModalOpen] = useState(false);

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
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

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

  const handleGenerateNewCertificate = () => {
    if (!user || contractClauses.length === 0) {
      toast({
        title: "Cannot Generate Certificate",
        description: "Please ensure there are contract agreements defined and you are logged in.",
        variant: "destructive",
      });
      return;
    }
    const newCertificate: GeneratedCertificate = {
      id: `cert-${Date.now()}`,
      dateGenerated: new Date(),
      clausesSnapshot: [...contractClauses], 
      unionName: user.displayName || "Unnamed Union",
    };
    setGeneratedCertificates(prev => [newCertificate, ...prev]);
    toast({
      title: "Certificate Generated",
      description: "A new certificate has been generated and added to the history.",
    });
  };

  const effectiveUser = user || {
    uid: 'mock-uid-default',
    displayName: 'My Union (Mock)',
    email: 'mock@example.com',
    relationshipStructure: '',
    religion: '',
    partners: [],
    isWalletConnected: false,
    connectedWalletAddress: null,
    holdingType: '',
    cnpjHolding: '',
    contractClauses: [],
  };

 useEffect(() => {
    let currentNodes = [...nodes];
    let currentEdges = [...edges];
    let nodesChanged = false;
    let edgesChanged = false;

    // 1. Ensure Union Node
    const existingUnionNode = currentNodes.find(node => node.id === UNION_NODE_ID);
    if (!existingUnionNode && !authLoading && effectiveUser?.displayName) {
      const unionNodeData: UnionNodeData = {
        label: effectiveUser.displayName,
        onSettingsClick: handleOpenContractSettings,
        onOpenAssetModal: handleOpenAssetModalForUnion,
        onAddMember: handleOpenAddMemberModal,
      };
      const unionNodeReactFlow: Node<UnionNodeData> = {
        id: UNION_NODE_ID, type: 'unionNode', position: { x: UNION_NODE_X_POS, y: UNION_NODE_Y_POS },
        data: unionNodeData, draggable: true, nodeOrigin,
      };
      currentNodes = [unionNodeReactFlow]; // Reset nodes if union node is created
      currentEdges = []; // Reset edges as well
      nodesChanged = true;
      edgesChanged = true;
    } else if (existingUnionNode && effectiveUser?.displayName && (existingUnionNode.data as UnionNodeData).label !== effectiveUser.displayName) {
      currentNodes = currentNodes.map(node =>
        node.id === UNION_NODE_ID
          ? { ...node, data: { ...(node.data as UnionNodeData), label: effectiveUser.displayName! } }
          : node
      );
      nodesChanged = true;
    }
    
    const unionNodeForLayout = currentNodes.find(n => n.id === UNION_NODE_ID);

    // 2. Ensure Partner Nodes (if union node exists)
    if (unionNodeForLayout && user?.partners && user.partners.length > 0) {
      const partnerNodesToAdd: Node<PartnerNodeData>[] = [];
      const partnerEdgesToAdd: Edge[] = [];
      
      const totalWidthForPartners = (user.partners.length * NODE_WIDTH) + (Math.max(0, user.partners.length - 1) * HORIZONTAL_SPACING);
      let currentPartnerX = (unionNodeForLayout.position?.x ?? UNION_NODE_X_POS) - (totalWidthForPartners / 2) + (NODE_WIDTH / 2);
      const partnerYPos = (unionNodeForLayout.position?.y ?? UNION_NODE_Y_POS) + PARTNER_ROW_Y_OFFSET;

      user.partners.forEach((partner, index) => {
        const partnerId = `partner-${index}-${partner.name.replace(/\s+/g, '-').toLowerCase()}`;
        if (!currentNodes.some(n => n.id === partnerId)) {
          partnerNodesToAdd.push({
            id: partnerId, type: 'partnerNode', position: { x: currentPartnerX, y: partnerYPos },
            data: { id: partnerId, name: partner.name }, draggable: true, nodeOrigin,
          });
          partnerEdgesToAdd.push({
            id: `e-${UNION_NODE_ID}-${partnerId}`, source: UNION_NODE_ID, target: partnerId,
            type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
          });
        }
        currentPartnerX += NODE_WIDTH + HORIZONTAL_SPACING;
      });

      if (partnerNodesToAdd.length > 0) {
        currentNodes = [...currentNodes, ...partnerNodesToAdd];
        nodesChanged = true;
      }
      if (partnerEdgesToAdd.length > 0) {
        currentEdges = [...currentEdges, ...partnerEdgesToAdd];
        edgesChanged = true;
      }
    }

    // 3. Ensure Mock Wallet Assets (if wallet connected and union node exists)
    if (user?.isWalletConnected && unionNodeForLayout && !authLoading) {
        const mockNodesToAddThisSegment: Node<ExtendedAssetNodeData>[] = [];
        const mockEdgesToAddThisSegment: Edge[] = [];

        // Define mock assets (BTC, ETH for Union)
        const unionMockAssetsConfig: Omit<ExtendedAssetNodeData, 'id' | 'userId' | 'onOpenDetails' | 'onOpenReleaseDialog' | 'assignedToMemberId' | 'releaseCondition' | 'tipoImovelBemFisico' | 'enderecoLocalizacaoFisico' | 'observacoes' | 'transactions'>[] = [
            { nomeAtivo: 'Bitcoin', tipo: 'digital', quantidadeTotalDigital: 0.5, isAutoLoaded: true },
            { nomeAtivo: 'Ethereum', tipo: 'digital', quantidadeTotalDigital: 10, isAutoLoaded: true },
        ];
        
        const unionNodeX = unionNodeForLayout.position?.x ?? UNION_NODE_X_POS;
        const unionNodeY = unionNodeForLayout.position?.y ?? UNION_NODE_Y_POS;

        const partnerNodesInCurrent = currentNodes.filter(n => n.type === 'partnerNode');
        const childrenNodesInCurrent = currentNodes.filter(n => n.type === 'memberNode' && currentEdges.some(e => e.source === UNION_NODE_ID && e.target === n.id));
        
        let unionDigitalAssetsYPos = unionNodeY + ASSET_ROW_Y_OFFSET;
        if (partnerNodesInCurrent.length > 0) {
            unionDigitalAssetsYPos = unionNodeY + PARTNER_ROW_Y_OFFSET + ASSET_ROW_Y_OFFSET; 
            if (childrenNodesInCurrent.length > 0) {
                 unionDigitalAssetsYPos += CHILDREN_ROW_Y_OFFSET;
            }
        } else if (childrenNodesInCurrent.length > 0) {
             unionDigitalAssetsYPos = unionNodeY + CHILDREN_ROW_Y_OFFSET + ASSET_ROW_Y_OFFSET;
        }

        const unionAssetsToConsider = unionMockAssetsConfig.filter(mockAsset => {
             const assetId = `mock-asset-${mockAsset.nomeAtivo.toLowerCase().replace(/\s+/g, '-')}-union`;
             return !currentNodes.some(n => n.id === assetId); 
        });

        const totalWidthForUnionMockAssets = (unionAssetsToConsider.length * NODE_WIDTH) + (Math.max(0, unionAssetsToConsider.length - 1) * HORIZONTAL_SPACING);
        let currentUnionMockX = unionNodeX - (totalWidthForUnionMockAssets / 2) + (NODE_WIDTH / 2);

        unionAssetsToConsider.forEach((mockAsset) => {
            const assetId = `mock-asset-${mockAsset.nomeAtivo.toLowerCase().replace(/\s+/g, '-')}-union`;
            // Check against currentNodes, not the global `nodes` to avoid race conditions within this effect
            if (!currentNodes.some(n => n.id === assetId)) {
                let assetDataForNode: ExtendedAssetNodeData = {
                    id: assetId, userId: effectiveUser.uid, nomeAtivo: mockAsset.nomeAtivo, tipo: 'digital',
                    quantidadeTotalDigital: mockAsset.quantidadeTotalDigital,
                    transactions: [{ id: `tx-${assetId}-${Date.now()}`, dataAquisicao: new Date(), quantidadeDigital: mockAsset.quantidadeTotalDigital, quemComprou: 'Connected Wallet'}],
                    isAutoLoaded: true, observacoes: `Asset ${mockAsset.nomeAtivo} automatically loaded.`,
                    onOpenDetails: () => {}, onOpenReleaseDialog: () => {},
                };
                assetDataForNode.onOpenDetails = () => handleOpenAssetDetailsModal(assetDataForNode);
                assetDataForNode.onOpenReleaseDialog = (ad) => handleOpenReleaseDialog(ad);

                mockNodesToAddThisSegment.push({
                    id: assetId, type: 'assetNode', position: { x: currentUnionMockX, y: unionDigitalAssetsYPos }, draggable: true, nodeOrigin,
                    data: assetDataForNode
                });
                mockEdgesToAddThisSegment.push({
                    id: `e-${UNION_NODE_ID}-${assetId}`, source: UNION_NODE_ID, target: assetId, type: 'smoothstep',
                    markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
                    style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
                });
                currentUnionMockX += NODE_WIDTH + HORIZONTAL_SPACING;
            }
        });

        // Add USDC for the first child if present
        const firstChildFromAllMembers = allMembers.find(m => m.tipoRelacao === 'filho_a');
        if (firstChildFromAllMembers?.id) {
          const childId = firstChildFromAllMembers.id;
          const usdcAssetId = `mock-usdc-child-${childId}`;
          const childNodeInstance = currentNodes.find(n => n.id === childId && n.type === 'memberNode');
          
          if (childNodeInstance && !currentNodes.some(n => n.id === usdcAssetId)) {
            let usdcAssetData: ExtendedAssetNodeData = {
              id: usdcAssetId, userId: effectiveUser.uid, nomeAtivo: 'USDC', tipo: 'digital',
              quantidadeTotalDigital: 5000,
              transactions: [{ id: `tx-usdc-${childId}`, dataAquisicao: new Date(), quantidadeDigital: 5000, quemComprou: 'Connected Wallet' }],
              isAutoLoaded: true, assignedToMemberId: childId,
              releaseCondition: { type: 'age', targetAge: 18 },
              observacoes: "USDC Reserve for the child.",
              onOpenDetails: () => {}, onOpenReleaseDialog: () => {},
            };
            usdcAssetData.onOpenDetails = () => handleOpenAssetDetailsModal(usdcAssetData);
            usdcAssetData.onOpenReleaseDialog = (ad) => handleOpenReleaseDialog(ad);

            const childNodeX = childNodeInstance.position?.x ?? 0;
            const childNodeY = childNodeInstance.position?.y ?? 0;
            const childAssetsYPos = childNodeY + ASSET_ROW_Y_OFFSET;
            const childAssetXPos = childNodeX; // Center under child

            mockNodesToAddThisSegment.push({
                id: usdcAssetId, type: 'assetNode', position: { x: childAssetXPos, y: childAssetsYPos }, draggable: true, nodeOrigin,
                data: usdcAssetData
            });
            mockEdgesToAddThisSegment.push({
                id: `e-${childId}-${usdcAssetId}`, source: childId, target: usdcAssetId, type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
                style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
            });
          }
        }
        
        if (mockNodesToAddThisSegment.length > 0) {
            currentNodes = [...currentNodes, ...mockNodesToAddThisSegment];
            nodesChanged = true;
        }
        if (mockEdgesToAddThisSegment.length > 0) {
            currentEdges = [...currentEdges, ...mockEdgesToAddThisSegment];
            edgesChanged = true;
        }
    }

    if (nodesChanged) {
      setNodes(currentNodes);
    }
    if (edgesChanged) {
      setEdges(currentEdges);
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    authLoading, 
    user?.isWalletConnected, 
    user?.uid, 
    user?.partners, 
    effectiveUser.displayName, 
    allMembers, // Changed from allMembers.length to allMembers itself for deeper comparison if needed
    // setNodes and setEdges are stable, adding them can cause infinite loops if not careful.
    // Callbacks should be memoized.
    handleOpenContractSettings, 
    handleOpenAssetModalForUnion, 
    handleOpenAddMemberModal, 
    handleOpenReleaseDialog, 
    handleOpenAssetDetailsModal
    // Removed direct dependency on 'nodes' and 'edges' to prevent loops.
    // The logic now uses a local `currentNodes` and `currentEdges` and only calls setNodes/setEdges if changes occurred.
  ]);


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
    
    const result = await addAsset(formData, effectiveUser.uid);
    
    const targetEntityIdForTx = memberContextForAssetAdd || (formData.assignedToMemberId === "UNASSIGNED" || !formData.assignedToMemberId ? UNION_NODE_ID : formData.assignedToMemberId);
    
    if (result.success && result.assetId && result.transactionId) {
        const newTransaction: AssetTransaction = {
            id: result.transactionId,
            dataAquisicao: formData.dataAquisicao,
            valorPagoEpoca: formData.valorPagoEpocaDigital,
            quemComprou: formData.quemComprou === "UNSPECIFIED_BUYER" || !formData.quemComprou ? "Main Union (Ipê Acta)" : formData.quemComprou,
            contribuicaoParceiro1: formData.contribuicaoParceiro1,
            contribuicaoParceiro2: formData.contribuicaoParceiro2,
            observacoes: formData.observacoes,
            tipoImovelBemFisico: formData.tipoImovelBemFisico, 
            enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico, 
        };
        
        const processedAssignedToMemberId = memberContextForAssetAdd || (formData.assignedToMemberId === "UNASSIGNED" ? undefined : formData.assignedToMemberId);
        const actualSourceNodeId = processedAssignedToMemberId || UNION_NODE_ID;
        const sourceNodeInstance = nodes.find(n => n.id === actualSourceNodeId);

        if (!sourceNodeInstance) {
            console.error("Source node not found for asset:", actualSourceNodeId);
            setIsSubmittingAsset(false);
            setMemberContextForAssetAdd(null);
            toast({ title: 'Error!', description: 'Parent node not found.', variant: 'destructive' });
            return;
        }
        
        let nodeDataPayload: ExtendedAssetNodeData = {
            id: result.assetId, // Use the result.assetId as the node's main ID
            userId: effectiveUser.uid,
            nomeAtivo: formData.nomeAtivo,
            tipo: 'fisico', // AssetForm is now only for physical assets
            transactions: [newTransaction],
            observacoes: formData.observacoes, 
            assignedToMemberId: processedAssignedToMemberId,
            releaseCondition: formData.setReleaseCondition && formData.releaseTargetAge && memberHasBirthDate(processedAssignedToMemberId) ? { type: 'age', targetAge: formData.releaseTargetAge } : undefined,
            isAutoLoaded: false,
            tipoImovelBemFisico: formData.tipoImovelBemFisico,
            enderecoLocalizacaoFisico: formData.enderecoLocalizacaoFisico,
            onOpenDetails: () => {},
            onOpenReleaseDialog: () => {},
        };
        nodeDataPayload.onOpenDetails = () => handleOpenAssetDetailsModal(nodeDataPayload);
        nodeDataPayload.onOpenReleaseDialog = (ad) => handleOpenReleaseDialog(ad);

        const sourceNodeX = sourceNodeInstance.position?.x ?? UNION_NODE_X_POS;
        const sourceNodeY = sourceNodeInstance.position?.y ?? UNION_NODE_Y_POS;
        let xPos: number;
        let yPos: number;
        
        // Filter physical assets linked to the source for positioning
        const assetsLinkedToSource = nodes.filter(n => 
            n.type === 'assetNode' && 
            edges.some(e => e.source === actualSourceNodeId && e.target === n.id) &&
            (n.data as ExtendedAssetNodeData).tipo === 'fisico' 
        );
        const physicalAssetNodesLinkedToSourceCount = assetsLinkedToSource.length;

        if (actualSourceNodeId === UNION_NODE_ID) {
            const partnerNodesExist = nodes.some(n => n.type === 'partnerNode');
            const childrenNodesExist = nodes.some(n => n.type === 'memberNode' && edges.some(e => e.source === UNION_NODE_ID && e.target === n.id));
            
            yPos = sourceNodeY + ASSET_ROW_Y_OFFSET;
            if (partnerNodesExist) {
                yPos = UNION_NODE_Y_POS + PARTNER_ROW_Y_OFFSET + CHILDREN_ROW_Y_OFFSET;
                 if (childrenNodesExist) {
                    yPos += ASSET_ROW_Y_OFFSET;
                }
            } else if (childrenNodesExist) {
                yPos = UNION_NODE_Y_POS + CHILDREN_ROW_Y_OFFSET + ASSET_ROW_Y_OFFSET;
            }
        } else { 
            yPos = sourceNodeY + ASSET_ROW_Y_OFFSET;
        }
        
        const totalWidthForRow = ((physicalAssetNodesLinkedToSourceCount + 1) * NODE_WIDTH) + (physicalAssetNodesLinkedToSourceCount * HORIZONTAL_SPACING);
        const startX = sourceNodeX - (totalWidthForRow / 2) + (NODE_WIDTH / 2);
        xPos = startX + (physicalAssetNodesLinkedToSourceCount * (NODE_WIDTH + HORIZONTAL_SPACING));


        const newAssetNodeReactFlow: Node<ExtendedAssetNodeData> = {
            id: result.assetId, type: 'assetNode', data: nodeDataPayload,
            position: { x: xPos, y: yPos },
            draggable: true, nodeOrigin,
        };

        setNodes((prevNodes) => prevNodes.concat(newAssetNodeReactFlow));
        setEdges((prevEdges) => prevEdges.concat({
            id: `e-${actualSourceNodeId}-${result.assetId!}`, source: actualSourceNodeId, target: result.assetId!,
            type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed, color: 'hsl(var(--primary))' },
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5 },
        }));
        toast({ title: 'Success!', description: `Asset ${formData.nomeAtivo} added successfully.` });
        
    } else {
        toast({ title: 'Error!', description: result.error || 'Could not add asset.', variant: 'destructive' });
    }
    
    setIsAssetModalOpen(false);
    setMemberContextForAssetAdd(null);
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

       const newMemberData: MemberWithBirthDateAndWallet = {
        id: result.memberId,
        unionId: UNION_NODE_ID,
        nome: data.nome,
        tipoRelacao: data.tipoRelacao, 
        dataNascimento: data.dataNascimento,
        walletAddress: data.walletAddress,
      };
      setAllMembers(prev => [...prev, newMemberData]);

      const unionNodeInstance = nodes.find(n => n.id === UNION_NODE_ID);
      if (!unionNodeInstance) {
        setIsSubmittingMember(false);
        return;
      }

      const unionNodeX = unionNodeInstance.position?.x ?? UNION_NODE_X_POS;
      const unionNodeY = unionNodeInstance.position?.y ?? UNION_NODE_Y_POS;
      
      let yPos = unionNodeY + CHILDREN_ROW_Y_OFFSET;
      const partnerNodesExist = nodes.some(n => n.type === 'partnerNode');
      if(partnerNodesExist) {
        yPos = UNION_NODE_Y_POS + PARTNER_ROW_Y_OFFSET + CHILDREN_ROW_Y_OFFSET;
      }
      
      const memberNodesCurrent = nodes.filter(n => n.type === 'memberNode' && edges.some(e => e.source === UNION_NODE_ID && e.target === n.id));
      const memberNodesCount = memberNodesCurrent.length;

      const totalWidthForRow = ((memberNodesCount + 1) * NODE_WIDTH) + (memberNodesCount * HORIZONTAL_SPACING);
      const startX = unionNodeX - (totalWidthForRow / 2) + (NODE_WIDTH / 2);
      const xPos = startX + (memberNodesCount * (NODE_WIDTH + HORIZONTAL_SPACING));

      const nodeDataPayload: ExtendedMemberNodeData = {
        id: result.memberId,
        name: data.nome,
        relationshipType: data.tipoRelacao,
        onAddAssetClick: (memberId) => handleOpenAssetModalForMember(memberId),
        walletAddress: data.walletAddress,
      };

      const newMemberNodeReactFlow: Node<ExtendedMemberNodeData> = {
        id: result.memberId,
        type: 'memberNode',
        data: nodeDataPayload,
        position: { x: xPos, y: yPos },
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
    if (!memberId || memberId === "Main Union (Ipê Acta)" || memberId === "Connected Wallet") return 'Main Union (Ipê Acta)';
    const member = allMembers.find(m => m.id === memberId);
    if (member) return member.nome;
    const partner = user?.partners?.find(p => {
      const partnerIdBase = p.name.replace(/\s+/g, '-').toLowerCase();
      return [`partner-0-${partnerIdBase}`, `partner-1-${partnerIdBase}`].includes(memberId);
    });
    if (partner) return partner.name;
    return 'Unknown Member';
  };

  const generateHoldingReportText = () => {
    let report = "Holding Report\n";
    report += "Generated on: " + format(new Date(), "MM/dd/yyyy HH:mm", { locale: enUS }) + "\n\n";
    report += `Union: ${effectiveUser.displayName || 'N/A'}\n`;
    report += "--------------------------------------\n\n";
    
    const partnerNodesData = nodes.filter(node => node.type === 'partnerNode').map(n => n.data as PartnerNodeData);
    if (partnerNodesData.length > 0) {
        report += "Partners in Union:\n";
        partnerNodesData.forEach(partner => {
            report += `- ${partner.name}\n`;
        });
        report += "\n";
    }


    const unionAssets = nodes.filter(node => node.type === 'assetNode' && edges.some(edge => edge.source === UNION_NODE_ID && edge.target === node.id));
    if (unionAssets.length > 0) {
      report += "Assets Directly Under Union:\n";
      unionAssets.forEach(assetNode => {
        const asset = assetNode.data as ExtendedAssetNodeData;
        report += `- ${asset.nomeAtivo} (${asset.tipo})\n`;
        if (asset.tipo === 'digital' && asset.quantidadeTotalDigital) {
          report += `  Quantity: ${asset.quantidadeTotalDigital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}\n`;
        }
        if (asset.tipo === 'fisico' && asset.tipoImovelBemFisico) {
          report += `  Type: ${asset.tipoImovelBemFisico}\n`;
        }
        if (asset.observacoes) {
          report += `  Notes: ${asset.observacoes}\n`;
        }
        report += "\n";
      });
    } else {
      report += "No assets directly under the main union.\n\n";
    }

    const children = nodes.filter(node => node.type === 'memberNode' && edges.some(edge => edge.source === UNION_NODE_ID && edge.target === node.id));
    if (children.length > 0) {
      report += "Members (Children):\n";
      children.forEach(childNode => {
        const child = childNode.data as ExtendedMemberNodeData;
        report += `\nMember: ${child.name}\n`;
        if (child.walletAddress) {
          report += `  Wallet: ${child.walletAddress}\n`;
        }
        const childAssets = nodes.filter(assetN => assetN.type === 'assetNode' && edges.some(edge => edge.source === childNode.id && edge.target === assetN.id));
        if (childAssets.length > 0) {
          report += "  Assigned Assets:\n";
          childAssets.forEach(assetNode => {
            const asset = assetNode.data as ExtendedAssetNodeData;
            report += `  - ${asset.nomeAtivo} (${asset.tipo})\n`;
            if (asset.tipo === 'digital' && asset.quantidadeTotalDigital) {
              report += `    Quantity: ${asset.quantidadeTotalDigital.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}\n`;
            }
            if (asset.tipo === 'fisico' && asset.tipoImovelBemFisico) {
              report += `    Type: ${asset.tipoImovelBemFisico}\n`;
            }
            if (asset.releaseCondition?.type === 'age') {
              report += `    Releases at: ${asset.releaseCondition.targetAge} years old\n`;
            }
            if (asset.observacoes) {
              report += `    Notes: ${asset.observacoes}\n`;
            }
          });
        } else {
          report += "  No assets assigned to this member.\n";
        }
      });
    } else {
      report += "No members (children) added to the union.\n";
    }
    return report;
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
            <DialogTitle className="text-2xl text-primary">Add New Physical Asset</DialogTitle>
            <DialogDescription className="text-muted-foreground">Fill in the details of your physical asset.</DialogDescription>
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
                    <LayoutGrid size={14} />
                    <span>Wallet Information</span>
                </div>
              )}

              <div className="space-y-3 pt-3 mt-3 border-t border-border/50">
                <h4 className="text-md font-semibold text-primary">Acquisition/Transaction History</h4>
                 {selectedAssetForDetails.transactions && selectedAssetForDetails.transactions.length > 0 ? (
                  <ScrollArea className="max-h-60 pr-2">
                    <div className="space-y-4">
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
                                <p className="text-foreground">{tx.quemComprou === "Main Union (Ipê Acta)" ? "Main Union (Ipê Acta)" : tx.quemComprou === "Connected Wallet" ? "Connected Wallet (Simulated)" : getMemberNameById(tx.quemComprou)}</p>
                              </div>
                            )}
                            {tx.quemComprou === 'Ambos' && effectiveUser?.partners && effectiveUser.partners.length >=2 && (
                              <>
                                {tx.contribuicaoParceiro1 !== undefined && (
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Contrib. ({effectiveUser.partners[0]?.name || 'Partner 1'})</Label>
                                    <p className="text-foreground">{tx.contribuicaoParceiro1.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</p>
                                  </div>
                                )}
                                {tx.contribuicaoParceiro2 !== undefined && (
                                  <div>
                                    <Label className="text-xs font-medium text-muted-foreground">Contrib. ({effectiveUser.partners[1]?.name || 'Partner 2'})</Label>
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
                  </ScrollArea>
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

      <Dialog open={isCertificateModalOpen} onOpenChange={setIsCertificateModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Marriage Certificate</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Review current agreements or generate a new certificate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="flex-1 text-foreground/90 border-border hover:bg-muted/80"
                onClick={() => {
                  setIsCertificateModalOpen(false);
                  handleOpenContractSettings();
                }}
              >
                <Settings className="mr-2 h-5 w-5" />
                Make Final Changes to Agreements
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleGenerateNewCertificate}
              >
                <FileText className="mr-2 h-5 w-5" />
                Generate New Certificate
              </Button>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">History of Generated Certificates:</h3>
              {generatedCertificates.length > 0 ? (
                <ScrollArea className="h-60 border rounded-md p-3 bg-muted/30">
                  <ul className="space-y-3">
                    {generatedCertificates.map((cert) => (
                      <li key={cert.id} className="p-3 bg-background/50 rounded-md text-sm text-foreground border border-border/30">
                        <p className="font-semibold">Certificate - {cert.unionName}</p>
                        <p className="text-xs text-muted-foreground">
                          Generated on: {format(cert.dateGenerated, "MM/dd/yyyy 'at' HH:mm", { locale: enUS })}
                        </p>
                        <details className="mt-1 text-xs">
                          <summary className="cursor-pointer text-primary/80 hover:text-primary">View Clauses ({cert.clausesSnapshot.length})</summary>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {cert.clausesSnapshot.map(clause => (
                              <li key={clause.id}>{clause.text}</li>
                            ))}
                          </ul>
                        </details>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground">No certificates generated yet.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHoldingReportModalOpen} onOpenChange={setIsHoldingReportModalOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">Holding Report Summary</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Textual summary of your holding structure.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] p-1">
            <pre className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-md">
              {generateHoldingReportText()}
            </pre>
          </ScrollArea>
          <div className="text-center text-xs text-muted-foreground mt-2">
            PDF Generation can be implemented here.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>


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
            onClick={() => setIsCertificateModalOpen(true)}
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
        >
            <FileText className="mr-2 h-5 w-5" />
            Generate Marriage Certificate
        </Button>
        <Button
            variant="outline"
            onClick={() => setIsHoldingReportModalOpen(true)}
            className="border-accent text-accent hover:bg-accent/10 hover:text-accent"
        >
            <Briefcase className="mr-2 h-5 w-5" />
            Holding Report
        </Button>
      </div>
    </div>
  );
}

declare module 'reactflow' {
  interface NodeData {
    // UnionNode
    id?: string; 
    label?: string;
    onSettingsClick?: () => void;
    onOpenAssetModal?: () => void;
    onAddMember?: () => void; 

    // MemberNode & PartnerNode
    name?: string; 
    relationshipType?: string; 
    onAddAssetClick?: (memberId: string) => void; 
    walletAddress?: string; 

    // AssetNode (ExtendedAssetNodeData fields)
    userId?: string;
    nomeAtivo?: string;
    tipo?: 'digital' | 'fisico'; 
    transactions?: AssetTransaction[]; 
    quantidadeTotalDigital?: number; 
    tipoImovelBemFisico?: string; 
    enderecoLocalizacaoFisico?: string; 
    assignedToMemberId?: string;
    releaseCondition?: { type: 'age'; targetAge: number };
    observacoes?: string; 
    isAutoLoaded?: boolean; 
    onOpenDetails?: () => void; 
    onOpenReleaseDialog?: (assetData: ExtendedAssetNodeData) => void; 
  }
}

