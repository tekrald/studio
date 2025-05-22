
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Edit3, FileText, Users, Save } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export interface ContractClause {
  id: string;
  text: string;
}

interface ContractSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clauses: ContractClause[];
  onAddClause: (text: string) => void;
  onRemoveClause: (id: string) => void;
  onUpdateClause: (id: string, newText: string) => void;
}

const suggestedClausesTemplates = {
  partilhaBens: [
    { id: 'sug_pb_1', text: "Partilha de bens em caso de término da união: divisão de 50/50 dos bens adquiridos em conjunto durante a união." },
    { id: 'sug_pb_2', text: "Bens adquiridos individualmente antes da união permanecerão como propriedade individual de cada parte." },
    { id: 'sug_pb_3', text: "Em caso de aquisição do bem [NOME DO BEM ESPECÍFICO], a propriedade será dividida em X% para Parte A e Z% para Parte B." },
  ],
  regrasConvivencia: [
    { id: 'sug_rc_1', text: "As despesas domésticas mensais (ex: contas de água, luz, internet) serão divididas da seguinte forma: [Descrever a divisão]." },
    { id: 'sug_rc_2', text: "Decisões financeiras de grande porte (acima de R$ [VALOR]) deverão ser discutidas e aprovadas por todas as partes envolvidas no contrato." },
    { id: 'sug_rc_3', text: "Viagens individuais: [Definir regras, ex: permitidas com comunicação prévia de X dias/semanas]." },
  ],
  // Removido: personalizado
  // personalizado: [
  //    { id: 'sug_cust_1', text: "Defina aqui seu acordo personalizado sobre [TEMA ESPECÍFICO]: [Descrever o acordo aqui]." }
  // ]
};

export function ContractSettingsDialog({
  isOpen,
  onClose,
  clauses,
  onAddClause,
  onRemoveClause,
  onUpdateClause,
}: ContractSettingsDialogProps) {
  const [newClauseText, setNewClauseText] = useState('');
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);

  const handleEditClick = (clause: ContractClause) => {
    setEditingClauseId(clause.id);
    setNewClauseText(clause.text);
  };

  const handleSaveOrAddClause = () => {
    if (newClauseText.trim()) {
      if (editingClauseId) {
        onUpdateClause(editingClauseId, newClauseText.trim());
      } else {
        onAddClause(newClauseText.trim());
      }
      setNewClauseText('');
      setEditingClauseId(null);
    }
  };

  const handleCancelEdit = () => {
    setNewClauseText('');
    setEditingClauseId(null);
  };
  
  const handleAddSuggestion = (text: string) => {
    setNewClauseText(prev => prev ? `${prev}\n${text}` : text);
    setEditingClauseId(null); // Se estava editando, e adiciona sugestão, sai do modo de edição
  };

  useEffect(() => {
    if (isOpen) {
      setNewClauseText('');
      setEditingClauseId(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-pacifico text-primary">Configurações do Contrato da União</DialogTitle>
          <DialogDescription>
            Adicione, visualize, edite e gerencie as cláusulas do seu contrato. Estas cláusulas são flexíveis e podem ser adaptadas a qualquer configuração familiar e crença.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 flex-grow min-h-0">
          {/* Coluna de Cláusulas Atuais */}
          <div className="md:col-span-2 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-3 text-foreground">Cláusulas Atuais</h3>
            {clauses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Nenhuma cláusula adicionada ainda. Comece adicionando uma nova ou usando uma sugestão.</p>
            ) : (
              <ScrollArea className="flex-grow border rounded-md p-4 bg-muted/30 max-h-[calc(90vh-350px)] md:max-h-[calc(100vh-300px)]">
                <ul className="space-y-3">
                  {clauses.map((clause) => (
                    <li key={clause.id} className="p-3 bg-card shadow rounded-md text-sm text-card-foreground">
                      <p className="whitespace-pre-wrap flex-grow mb-2">{clause.text}</p>
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => handleEditClick(clause)}>
                          <Edit3 size={16} className="mr-1" /> Editar
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80" onClick={() => onRemoveClause(clause.id)}>
                          <Trash2 size={16} className="mr-1" /> Remover
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </div>

          {/* Coluna de Adicionar/Editar Cláusula e Sugestões */}
          <div className="flex flex-col space-y-6 min-h-0">
            <div>
              <Label htmlFor="clause-text-area" className="text-lg font-semibold mb-2 text-foreground block">
                {editingClauseId ? 'Editar Cláusula' : 'Adicionar Nova Cláusula'}
              </Label>
              <Textarea
                id="clause-text-area"
                value={newClauseText}
                onChange={(e) => setNewClauseText(e.target.value)}
                placeholder="Digite o texto da cláusula aqui..."
                className="min-h-[100px]"
                rows={5}
              />
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSaveOrAddClause} className="w-full sm:flex-1" disabled={!newClauseText.trim()}>
                  {editingClauseId ? <><Save size={18} className="mr-2" /> Salvar Alterações</> : <><PlusCircle size={18} className="mr-2" /> Adicionar Cláusula</>}
                </Button>
                {editingClauseId && (
                  <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto">
                    Cancelar Edição
                  </Button>
                )}
              </div>
            </div>
            
            <Separator />

            <div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">Sugestões de Cláusulas</h3>
              <ScrollArea className="max-h-[calc(90vh-500px)] md:max-h-[calc(100vh-480px)] pr-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold text-primary mb-1.5 flex items-center"><FileText size={18} className="mr-2"/>Partilha de Bens</h4>
                    {suggestedClausesTemplates.partilhaBens.map(sug => (
                        <Button key={sug.id} variant="outline" size="sm" className="text-xs w-full justify-start text-left h-auto py-1.5 mb-1.5" onClick={() => handleAddSuggestion(sug.text)}>
                         {sug.text}
                        </Button>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-primary mb-1.5 flex items-center"><Users size={18} className="mr-2"/>Regras de Acordo Comum</h4>
                     {suggestedClausesTemplates.regrasConvivencia.map(sug => (
                        <Button key={sug.id} variant="outline" size="sm" className="text-xs w-full justify-start text-left h-auto py-1.5 mb-1.5" onClick={() => handleAddSuggestion(sug.text)}>
                         {sug.text}
                        </Button>
                    ))}
                  </div>
                  {/* Removido: Seção "Acordo Personalizado"
                  <div>
                    <h4 className="text-md font-semibold text-primary mb-1.5 flex items-center"><Edit3 size={18} className="mr-2"/>Acordo Personalizado</h4>
                     {suggestedClausesTemplates.personalizado.map(sug => (
                        <Button key={sug.id} variant="outline" size="sm" className="text-xs w-full justify-start text-left h-auto py-1.5 mb-1.5" onClick={() => handleAddSuggestion(sug.text)}>
                         {sug.text}
                        </Button>
                    ))}
                  </div>
                  */}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

