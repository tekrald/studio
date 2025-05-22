
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
import { PlusCircle, Trash2, Edit3, FileText, Users } from 'lucide-react';
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
  // onUpdateClause: (id: string, newText: string) => void; // For future editing
}

const suggestedClausesTemplates = {
  partilhaBens: [
    { id: 'sug_pb_1', text: "Partilha de bens em caso de separação: 50/50 dos bens adquiridos em conjunto durante a união." },
    { id: 'sug_pb_2', text: "Bens adquiridos antes da união permanecerão como propriedade individual de cada parte." },
    { id: 'sug_pb_3', text: "Em caso de aquisição de imóvel X, a propriedade será dividida em Y% para Parte A e Z% para Parte B." },
  ],
  regrasConvivencia: [
    { id: 'sug_rc_1', text: "As despesas domésticas mensais (contas de água, luz, internet, etc.) serão divididas igualmente entre as partes." },
    { id: 'sug_rc_2', text: "Decisões financeiras de grande porte (acima de R$ X.XXX,XX) deverão ser discutidas e aprovadas por ambas as partes." },
    { id: 'sug_rc_3', text: "Viagens individuais são permitidas, desde que comunicadas com antecedência mínima de X dias/semanas." },
  ],
};

export function ContractSettingsDialog({
  isOpen,
  onClose,
  clauses,
  onAddClause,
  onRemoveClause,
}: ContractSettingsDialogProps) {
  const [newClauseText, setNewClauseText] = useState('');
  // const [editingClause, setEditingClause] = useState<ContractClause | null>(null); // For future editing

  const handleSaveNewClause = () => {
    if (newClauseText.trim()) {
      onAddClause(newClauseText.trim());
      setNewClauseText('');
    }
  };
  
  const handleAddSuggestion = (text: string) => {
    setNewClauseText(prev => prev ? `${prev}\n${text}` : text);
  };

  useEffect(() => {
    if (isOpen) {
      setNewClauseText('');
      // setEditingClause(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-pacifico text-primary">Configurações do Contrato da União</DialogTitle>
          <DialogDescription>
            Adicione, visualize e gerencie as cláusulas do seu contrato.
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
                        {/* <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700" onClick={() => {}}>
                          <Edit3 size={16} className="mr-1" /> Editar
                        </Button> */}
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

          {/* Coluna de Adicionar Cláusula e Sugestões */}
          <div className="flex flex-col space-y-6 min-h-0">
            <div>
              <Label htmlFor="new-clause" className="text-lg font-semibold mb-2 text-foreground block">Adicionar Nova Cláusula</Label>
              <Textarea
                id="new-clause"
                value={newClauseText}
                onChange={(e) => setNewClauseText(e.target.value)}
                placeholder="Digite o texto da nova cláusula aqui..."
                className="min-h-[100px]"
                rows={5}
              />
              <Button onClick={handleSaveNewClause} className="mt-3 w-full" disabled={!newClauseText.trim()}>
                <PlusCircle size={18} className="mr-2" /> Adicionar Cláusula
              </Button>
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
                    <h4 className="text-md font-semibold text-primary mb-1.5 flex items-center"><Users size={18} className="mr-2"/>Regras de Convivência</h4>
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
