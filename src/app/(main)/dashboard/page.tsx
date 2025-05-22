
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Users, FileText, Settings, Network, DollarSign, Brain, LayoutGrid } from 'lucide-react';
import { AssetForm } from '@/components/assets/AssetForm';
import type { AssetFormData } from '@/types/asset';
import { addAsset } from '@/actions/assetActions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
// import { ReactFlowProvider } from 'reactflow'; // Futura integração

export default function AssetManagementDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [nodes, setNodes] = useState([]); // Estado para os nós do React Flow
  // const [edges, setEdges] = useState([]); // Estado para as arestas do React Flow

  // Efeito para buscar dados do Firestore para o canvas (a ser implementado)
  useEffect(() => {
    if (user) {
      // Lógica para buscar membros e ativos do Firestore e popular os 'nodes' e 'edges'
      // Ex: fetchFamilyData(user.uid).then(data => { setNodes(data.nodes); setEdges(data.edges); });
    }
  }, [user]);

  if (!user && !isLoading) { // Se não houver usuário e não estiver carregando, exibir loader
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!user && isLoading) { // Se estiver carregando e não houver usuário (primeiro load)
     return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }


  const handleAddAssetSubmit = async (data: AssetFormData) => {
    if (!user) {
      toast({ title: 'Erro!', description: 'Usuário não autenticado.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    const result = await addAsset(data, user.uid);
    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });
      // Aqui, em uma implementação com React Flow, você adicionaria um novo nó de ativo ao estado 'nodes'
      // Ex: setNodes((nds) => nds.concat({ id: result.assetId, type: 'assetNode', data: { ... }, position: { x: Math.random() * 400, y: Math.random() * 400 } }));
      setIsAssetModalOpen(false);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o ativo.', variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleAddMember = () => {
    // Lógica para adicionar um membro (ex: abrir um modal de formulário de membro)
    toast({ title: 'Em Breve!', description: 'Funcionalidade de adicionar membros será implementada.' });
  };

  const handleConfigureContract = () => {
    // Lógica para configurar o contrato familiar
    toast({ title: 'Em Breve!', description: 'Funcionalidade de configurar contrato será implementada.' });
  };

  return (
    // <ReactFlowProvider> // Envolveria o conteúdo com ReactFlowProvider no futuro
      <div className="flex flex-col h-[calc(100vh-var(--header-height,100px)-2rem)]"> {/* Ajustar header-height se necessário */}
        {/* Header do Dashboard */}
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
          {/* Barra de Ferramentas / Ações */}
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

          {/* Área do Canvas Principal */}
          <Card className="flex-grow p-1 shadow-lg relative">
            <CardHeader className="absolute top-2 left-3 z-10">
              <CardTitle className="text-lg font-pacifico text-muted-foreground">Canvas de Gestão</CardTitle>
            </CardHeader>
            <div className="w-full h-full bg-muted/30 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center">
              {/* 
                Aqui viria o componente React Flow:
                <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
                  <Controls />
                  <MiniMap />
                  <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
              */}
              <div className="text-center text-muted-foreground">
                <LayoutGrid size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">Seu canvas de gestão familiar aparecerá aqui.</p>
                <p className="text-sm">Use as ações ao lado para adicionar membros e ativos.</p>
                <p className="text-xs mt-4">(Integração com canvas interativo é um próximo passo)</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    // </ReactFlowProvider>
  );
}
