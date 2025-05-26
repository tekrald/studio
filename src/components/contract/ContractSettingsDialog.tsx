
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
import { PlusCircle, Trash2, Edit3, FileText, Users, Save, Landmark } from 'lucide-react';
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
    { id: 'sug_pb_1', text: "Partilha de ativos em caso de dissolução: divisão de 50/50 dos ativos adquiridos em conjunto durante a vigência do acordo." },
    { id: 'sug_pb_2', text: "Ativos adquiridos individualmente antes do acordo permanecerão como propriedade individual de cada parte." },
    { id: 'sug_pb_3', text: "Em caso de aquisição do ativo [NOME DO ATIVO ESPECÍFICO], a propriedade será dividida em X% para Parte A e Z% para Parte B." },
  ],
  regrasConvivencia: [ // Rebatizado para "Regras da Sociedade"
    { id: 'sug_rc_1', text: "As despesas operacionais (ex: custos de manutenção, taxas) serão divididas da seguinte forma: [Descrever a divisão]." },
    { id: 'sug_rc_2', text: "Decisões financeiras de grande porte (acima de [VALOR/MOEDA]) deverão ser discutidas e aprovadas por todas as partes envolvidas no acordo." },
    { id: 'sug_rc_3', text: "Contribuições e responsabilidades: [Definir regras para aportes, trabalho, etc.]." },
  ],
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
    setEditingClauseId(null); 
  };

  useEffect(() => {
    if (isOpen) {
      if (!editingClauseId) {
        setNewClauseText('');
      }
    } else {
      setNewClauseText('');
      setEditingClauseId(null);
    }
  }, [isOpen, editingClauseId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">Configurações dos Acordos</DialogTitle>
          <DialogDescription>
            Adicione, visualize, edite e gerencie as cláusulas dos seus acordos e registros em Ipê City.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 flex-grow min-h-0">
          <div className="md:col-span-2 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-3 text-foreground">Cláusulas Atuais</h3>
            {clauses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Nenhuma cláusula adicionada ainda. Comece adicionando uma nova ou usando uma sugestão.</p>
            ) : (
              <ScrollArea className="flex-grow border rounded-md p-4 bg-muted/30 max-h-[calc(90vh-350px)] md:max-h-none">
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
              <ScrollArea className="max-h-[calc(90vh-500px)] md:max-h-none pr-2"> 
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold text-primary mb-1.5 flex items-center"><Landmark size={18} className="mr-2"/>Partilha de Ativos</h4>
                    {suggestedClausesTemplates.partilhaBens.map(sug => (
                        <Button key={sug.id} variant="outline" size="sm" className="text-xs w-full justify-start text-left h-auto py-1.5 mb-1.5" onClick={() => handleAddSuggestion(sug.text)}>
                         {sug.text}
                        </Button>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-primary mb-1.5 flex items-center"><Users size={18} className="mr-2"/>Regras da Sociedade</h4>
                     {suggestedClausesTemplates.regrasConvivencia.map(sug => (
                        <Button key={sug.id} variant="outline" size="sm" className="text-xs w-full justify-start text-left h-auto py-1.5 mb-1.5" onClick={() => handleAddSuggestion(sug.text)}>
                         {sug.text}
                        </Button>
                    ))}
                  </div>
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
