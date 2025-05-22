
"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, FileText, Settings, Network, DollarSign, Brain, LayoutGrid, Link2 } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData } from '@/types/asset';
import { addAsset } from '@/actions/assetActions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface Node {
  id: string;
  type: 'union' | 'asset'; // Adicionar 'member' futuramente
  data: { label: string; details?: string };
  position: { x: number; y: number };
}

interface Edge {
  id: string;
  source: string;
  target: string;
}

const UNION_NODE_ID = 'union-node';

export default function AssetManagementDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    if (user && !nodes.find(node => node.id === UNION_NODE_ID)) {
      const unionNode: Node = {
        id: UNION_NODE_ID,
        type: 'union',
        data: { label: user.displayName || 'Nossa União' },
        position: { x: 350, y: 50 }, // Posição inicial do nó União
      };
      setNodes([unionNode]);
    }
  }, [user, nodes]);


  const handleAddAssetSubmit = async (data: AssetFormData) => {
    if (!user) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await addAsset(data, user.uid); // Firebase ainda está desabilitado aqui
    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });
      
      const newAssetNode: Node = {
        id: result.assetId,
        type: 'asset',
        data: { 
          label: data.nomeAtivo,
          details: `Tipo: ${data.tipo === 'digital' ? 'Digital' : 'Físico'}, Valor: R$ ${data.valorAtualEstimado}`
        },
        // Lógica simples para posicionar novos nós de ativos
        position: { 
          x: 100 + (nodes.filter(n => n.type === 'asset').length % 4) * 200, 
          y: 200 + Math.floor(nodes.filter(n => n.type === 'asset').length / 4) * 120
        },
      };
      setNodes((prevNodes) => [...prevNodes, newAssetNode]);

      const newEdge: Edge = {
        id: `e-${UNION_NODE_ID}-${result.assetId}`,
        source: UNION_NODE_ID,
        target: result.assetId,
      };
      setEdges((prevEdges) => [...prevEdges, newEdge]);

      setIsAssetModalOpen(false);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o ativo.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleAddMember = () => {
    toast({ title: 'Em Breve!', description: 'Funcionalidade de adicionar membros será implementada.' });
  };

  const handleConfigureContract = () => {
    toast({ title: 'Em Breve!', description: 'Funcionalidade de configurar contrato será implementada.' });
  };

  if (authLoading && !user) { 
    return (
      <div className="flex min-h-[calc(100vh-var(--header-height,100px)-2rem)] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Se o usuário não estiver carregado após o authLoading ter terminado, não renderizar o dashboard
  // Isso pode acontecer brevemente antes do redirecionamento para /login pelo MainAppLayout
  if (!user) {
    return null; // Ou um spinner mais discreto se preferir, mas o MainAppLayout deve redirecionar
  }


  return (
      <div className="flex flex-col h-[calc(100vh-var(--header-height,100px)-2rem)]">
        <Card className="mb-6 shadow-xl bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))]">
          <CardHeader className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Network className="h-10 w-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-4xl text-white font-pacifico">Holding Familiar</CardTitle>
                <CardDescription className="text-white/90 text-lg mt-1">
                  Visualize e gerencie os membros e ativos da sua família.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="flex flex-grow gap-4">
          <Card className="w-64 p-4 space-y-3 flex-shrink-0 shadow-lg">
            <CardTitle className="text-xl font-pacifico text-primary mb-3">Ações</CardTitle>
            
            <Button onClick={() => setIsAssetModalOpen(true)} className="w-full justify-start">
              <DollarSign className="mr-2 h-5 w-5" /> Adicionar Ativo
            </Button>
            <Dialog open={isAssetModalOpen} onOpenChange={setIsAssetModalOpen}>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-pacifico text-primary">Adicionar Novo Ativo</DialogTitle>
                  <DialogDescription>Preencha os detalhes do seu ativo.</DialogDescription>
                </DialogHeader>
                <AssetForm onSubmit={handleAddAssetSubmit} isLoading={isLoading} onClose={() => setIsAssetModalOpen(false)} />
              </DialogContent>
            </Dialog>

            <Button onClick={handleAddMember} variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-5 w-5" /> Adicionar Membro
            </Button>
            <Button onClick={handleConfigureContract} variant="outline" className="w-full justify-start">
              <FileText className="mr-2 h-5 w-5" /> Configurar Contrato
            </Button>
             <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Em Breve!', description: 'Brainstorm de ideias será implementado.'})}>
              <Brain className="mr-2 h-5 w-5" /> Brainstorm IA
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: 'Em Breve!', description: 'Configurações do canvas serão implementadas.'})}>
              <Settings className="mr-2 h-5 w-5" /> Configurações
            </Button>
          </Card>

          <Card className="flex-grow p-1 shadow-lg relative overflow-hidden">
            <CardHeader className="absolute top-2 left-3 z-10">
              <CardTitle className="text-lg font-pacifico text-muted-foreground">Canvas de Gestão</CardTitle>
            </CardHeader>
            <div className="w-full h-full bg-muted/30 rounded-md border-2 border-dashed border-gray-300 relative">
              {/* Renderização dos Nós */}
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute p-3 rounded-lg shadow-md border ${
                    node.type === 'union' ? 'bg-primary text-primary-foreground' : 'bg-card text-card-foreground'
                  } transform -translate-x-1/2 -translate-y-1/2 min-w-[150px] max-w-[200px] text-center`}
                  style={{ left: `${node.position.x}px`, top: `${node.position.y}px` }}
                >
                  <div className="font-semibold text-sm">{node.data.label}</div>
                  {node.data.details && <div className="text-xs mt-1 opacity-80">{node.data.details}</div>}
                  {node.type === 'asset' && <DollarSign className="w-4 h-4 inline-block mr-1 opacity-70" />}
                  {node.type === 'union' && <Network className="w-4 h-4 inline-block mr-1 opacity-70" />}
                </div>
              ))}
              
              {/* Renderização das Arestas (SVGs) */}
              <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
                {edges.map((edge) => {
                  const sourceNode = nodes.find((n) => n.id === edge.source);
                  const targetNode = nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;
                  
                  // Ajustar pontos para centro dos nós (assumindo nós de tamanho fixo para simplificar)
                  // Isso é bem rudimentar, bibliotecas de grafos lidam com isso de forma mais robusta
                  const sourceX = sourceNode.position.x; // + 75; // Metade da largura do nó
                  const sourceY = sourceNode.position.y; // + 30; // Metade da altura do nó
                  const targetX = targetNode.position.x; // + 75;
                  const targetY = targetNode.position.y; // + 30;

                  return (
                    <line
                      key={edge.id}
                      x1={sourceX}
                      y1={sourceY}
                      x2={targetX}
                      y2={targetY}
                      stroke="hsl(var(--border))"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {nodes.length === 0 && !authLoading && (
                 <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground">
                    <div>
                        <LayoutGrid size={64} className="mx-auto mb-4 opacity-50" />
                        <p className="text-xl">Seu canvas de gestão familiar aparecerá aqui.</p>
                        <p className="text-sm">Use as ações ao lado para adicionar membros e ativos.</p>
                    </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
  );
}
