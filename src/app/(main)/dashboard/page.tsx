
"use client";
import { useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { PlusCircle, Briefcase, Bitcoin, Landmark, Building, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { AssetForm } from '@/components/assets/AssetForm';
import type { Asset, AssetFormData } from '@/types/asset';
import { addAsset } from '@/actions/assetActions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Mock data - em uma aplicação real, isso viria do Firestore
const mockDigitalAssets: Asset[] = [
  // { id: 'd1', userId: 'mock', tipo: 'digital', nomeAtivo: 'Bitcoin (BTC)', descricaoDetalhada: 'Investimento de longo prazo em BTC', valorAtualEstimado: 250000, observacoesInvestimento: 'Compra inicial de R$50k, valorizou.', dataAquisicao: new Date('2021-05-10'), tipoCriptoAtivoDigital: 'Criptomoeda', quantidadeDigital: 0.5, valorPagoEpocaDigital: 50000 },
  // { id: 'd2', userId: 'mock', tipo: 'digital', nomeAtivo: 'Ethereum (ETH)', descricaoDetalhada: 'Parte da estratégia de diversificação', valorAtualEstimado: 80000, observacoesInvestimento: 'Staking ativo.', dataAquisicao: new Date('2022-01-15'), tipoCriptoAtivoDigital: 'Criptomoeda', quantidadeDigital: 3, valorPagoEpocaDigital: 45000 },
];

const mockPhysicalAssets: Asset[] = [
  // { id: 'p1', userId: 'mock', tipo: 'fisico', nomeAtivo: 'Apartamento Praia Grande', descricaoDetalhada: 'Apto 2 dorms, vista mar', valorAtualEstimado: 600000, observacoesInvestimento: 'Financiado, parcelas R$2500. Entrada João R$50k, Maria R$30k.', dataAquisicao: new Date('2020-02-20'), tipoImovelBemFisico: 'Apartamento', enderecoLocalizacaoFisico: 'Av. Castelo Branco, 123, Praia Grande - SP' },
  // { id: 'p2', userId: 'mock', tipo: 'fisico', nomeAtivo: 'Carro SUV', descricaoDetalhada: 'Veículo da família', valorAtualEstimado: 120000, observacoesInvestimento: 'Quitado. Comprado por João.', dataAquisicao: new Date('2021-11-05'), tipoImovelBemFisico: 'Carro' },
];


export default function AssetManagementDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Em uma app real, estes estados seriam populados com dados do Firestore
  const [digitalAssets, setDigitalAssets] = useState<Asset[]>(mockDigitalAssets);
  const [physicalAssets, setPhysicalAssets] = useState<Asset[]>(mockPhysicalAssets);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleAddAsset = async (data: AssetFormData) => {
    setIsLoading(true);
    // console.log("Dados para adicionar:", data, "User ID:", user.uid);
    const result = await addAsset(data, user.uid);
    if (result.success && result.assetId) {
      toast({ title: 'Sucesso!', description: 'Ativo adicionado com sucesso.' });
      // Aqui você atualizaria a lista de ativos buscando do Firestore ou adicionando localmente
      // Por simplicidade, vamos apenas fechar o modal
      // Em uma aplicação real: refetchAssets();
      const newAssetEntry = { ...data, id: result.assetId, userId: user.uid, dataAquisicao: new Date(data.dataAquisicao) } as Asset;
      if (data.tipo === 'digital') {
        setDigitalAssets(prev => [newAssetEntry, ...prev]);
      } else {
        setPhysicalAssets(prev => [newAssetEntry, ...prev]);
      }
      setIsModalOpen(false);
    } else {
      toast({ title: 'Erro!', description: result.error || 'Não foi possível adicionar o ativo.', variant: 'destructive' });
    }
    setIsLoading(false);
  };
  
  const AssetCard = ({ asset }: { asset: Asset }) => (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-pacifico text-primary">{asset.nomeAtivo}</CardTitle>
            <CardDescription className="text-xs">
              Adquirido em: {format(new Date(asset.dataAquisicao), "dd/MM/yyyy", { locale: ptBR })}
            </CardDescription>
          </div>
          {asset.tipo === 'digital' ? 
            <Bitcoin className="h-6 w-6 text-accent" /> : 
            <Landmark className="h-6 w-6 text-accent" />
          }
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p><strong className="font-semibold">Valor Estimado:</strong> R$ {asset.valorAtualEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="text-muted-foreground truncate" title={asset.descricaoDetalhada}>{asset.descricaoDetalhada}</p>
        {asset.tipo === 'digital' && 'tipoCriptoAtivoDigital' in asset && (
          <p><strong className="font-semibold">Tipo Digital:</strong> {asset.tipoCriptoAtivoDigital}</p>
        )}
        {asset.tipo === 'fisico' && 'tipoImovelBemFisico' in asset && (
          <p><strong className="font-semibold">Tipo Físico:</strong> {asset.tipoImovelBemFisico}</p>
        )}
         <div className="text-xs text-muted-foreground pt-1 overflow-hidden max-h-10">
            <strong className="font-semibold block text-foreground/80">Detalhes Invest.:</strong> 
            <span className="line-clamp-2" title={asset.observacoesInvestimento}>{asset.observacoesInvestimento}</span>
        </div>
      </CardContent>
      <div className="p-4 pt-2 flex justify-end space-x-2">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary"><Eye className="h-4 w-4 mr-1" /> Ver</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500"><Edit className="h-4 w-4 mr-1" /> Editar</Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4 mr-1" /> Excluir</Button>
      </div>
    </Card>
  );


  return (
    <div className="space-y-8">
      <Card className="overflow-hidden shadow-xl bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))]">
        <CardHeader className="p-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Briefcase className="h-10 w-10 text-white" />
            </div>
            <div>
              <CardTitle className="text-4xl text-white font-pacifico">Gestão de Patrimônio</CardTitle>
              <CardDescription className="text-white/90 text-lg mt-1">
                Olá, {user.displayName || 'Casal'}! Gerencie seus ativos digitais e físicos aqui.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-pacifico text-primary">Adicionar Novo Ativo</DialogTitle>
            <DialogDescription>Preencha os detalhes do seu ativo.</DialogDescription>
          </DialogHeader>
          <AssetForm onSubmit={handleAddAsset} isLoading={isLoading} onClose={() => setIsModalOpen(false)} />
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Patrimônio Digital */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <Bitcoin className="h-8 w-8 mr-3 text-primary" />
              <CardTitle className="text-2xl font-pacifico">Patrimônio Digital</CardTitle>
            </div>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Digital
              </Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent className="space-y-4">
            {digitalAssets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum ativo digital cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {digitalAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patrimônio Físico */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center">
              <Landmark className="h-8 w-8 mr-3 text-primary" />
              <CardTitle className="text-2xl font-pacifico">Patrimônio Físico</CardTitle>
            </div>
             <DialogTrigger asChild>
                <Button size="sm" onClick={() => setIsModalOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Físico
                </Button>
            </DialogTrigger>
          </CardHeader>
          <CardContent className="space-y-4">
             {physicalAssets.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nenhum ativo físico cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {physicalAssets.map(asset => <AssetCard key={asset.id} asset={asset} />)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-pacifico">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-muted-foreground space-y-1">
            <li>Visualize e edite os ativos cadastrados.</li>
            <li>Adicione funcionalidades para "Membros" e "Contratos".</li>
            <li>Implemente filtros e buscas para os ativos.</li>
            <li>Desenvolva gráficos e relatórios do patrimônio total.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
