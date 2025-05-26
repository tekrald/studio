
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
import { PlusCircle, Trash2, Edit3, Users, Save, Landmark } from 'lucide-react';
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
  dialogTitle?: string;
  dialogDescription?: string;
}

const suggestedClausesTemplates = {
  assetSharing: [
    { id: 'sug_as_1', text: "Asset sharing in case of union dissolution: 50/50 division of assets acquired jointly during the agreement." },
    { id: 'sug_as_2', text: "Individually acquired assets before the union will remain as individual property of each party." },
    { id: 'sug_as_3', text: "In case of acquisition of the asset [SPECIFIC ASSET NAME], ownership will be divided X% for Party A and Z% for Party B." },
  ],
  cohabitationRules: [
    { id: 'sug_cr_1', text: "Operational expenses of the union (e.g., maintenance costs, fees) will be divided as follows: [Describe the division]." },
    { id: 'sug_cr_2', text: "Major financial decisions (above [VALUE/CURRENCY]) must be discussed and approved by both parties of the union." },
    { id: 'sug_cr_3', text: "Financial contributions and responsibilities: [Define rules for contributions, work, etc.]." },
  ],
};

export function ContractSettingsDialog({
  isOpen,
  onClose,
  clauses,
  onAddClause,
  onRemoveClause,
  onUpdateClause,
  dialogTitle = "Agreement Settings",
  dialogDescription = "Add, view, edit, and manage the clauses of your contract. This system is flexible to accommodate various configurations and agreements."
}: ContractSettingsDialogProps) {
  const [newClauseText, setNewClauseText] = useState('');
  const [editingClauseId, setEditingClauseId] = useState<string | null>(null);
  const [currentClauseTextForEdit, setCurrentClauseTextForEdit] = useState('');

  const handleEditClick = (clause: ContractClause) => {
    setEditingClauseId(clause.id);
    setCurrentClauseTextForEdit(clause.text);
  };

  const handleSaveOrAddClause = () => {
    const textToSave = editingClauseId ? currentClauseTextForEdit : newClauseText;
    if (textToSave.trim()) {
      if (editingClauseId) {
        onUpdateClause(editingClauseId, textToSave.trim());
      } else {
        onAddClause(textToSave.trim());
      }
      setNewClauseText('');
      setCurrentClauseTextForEdit('');
      setEditingClauseId(null);
    }
  };

  const handleCancelEdit = () => {
    setCurrentClauseTextForEdit('');
    setEditingClauseId(null);
  };

  const handleAddSuggestion = (text: string) => {
    if (editingClauseId) {
        setCurrentClauseTextForEdit(prev => prev ? `${prev}\n${text}` : text);
    } else {
        setNewClauseText(prev => prev ? `${prev}\n${text}` : text);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setNewClauseText('');
      setCurrentClauseTextForEdit('');
      setEditingClauseId(null);
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[90vh] flex flex-col bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary">{dialogTitle}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 flex-grow min-h-0">
          <div className="md:col-span-2 flex flex-col min-h-0">
            <h3 className="text-lg font-semibold mb-3 text-foreground">Current Clauses</h3>
            {clauses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No clauses added yet. Start by adding a new one or using a suggestion.</p>
            ) : (
              <ScrollArea className="flex-grow border border-border rounded-md p-4 bg-background max-h-[calc(90vh-350px)] md:max-h-none">
                <ul className="space-y-3">
                  {clauses.map((clause) => (
                    <li key={clause.id} className="p-3 bg-card shadow rounded-md text-sm text-card-foreground border border-border/50">
                      <p className="whitespace-pre-wrap flex-grow mb-2">{clause.text}</p>
                      <div className="flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={() => handleEditClick(clause)}>
                          <Edit3 size={16} className="mr-1" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive/80" onClick={() => onRemoveClause(clause.id)}>
                          <Trash2 size={16} className="mr-1" /> Remove
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
                {editingClauseId ? 'Edit Clause' : 'Add New Clause'}
              </Label>
              <Textarea
                id="clause-text-area"
                value={editingClauseId ? currentClauseTextForEdit : newClauseText}
                onChange={(e) => editingClauseId ? setCurrentClauseTextForEdit(e.target.value) : setNewClauseText(e.target.value)}
                placeholder="Enter clause text here..."
                className="min-h-[100px] bg-input text-foreground placeholder:text-muted-foreground"
                rows={5}
              />
              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSaveOrAddClause} className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!(editingClauseId ? currentClauseTextForEdit.trim() : newClauseText.trim())}>
                  {editingClauseId ? <><Save size={18} className="mr-2" /> Save Changes</> : <><PlusCircle size={18} className="mr-2" /> Add Clause</>}
                </Button>
                {editingClauseId && (
                  <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto text-foreground/90 border-border hover:bg-muted/80">
                    Cancel Edit
                  </Button>
                )}
              </div>
            </div>

            <Separator className="bg-border"/>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-foreground">Clause Suggestions</h3>
              <ScrollArea className="max-h-[calc(90vh-500px)] md:max-h-none pr-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-md font-semibold text-primary mb-1.5 flex items-center"><Landmark size={18} className="mr-2"/>Asset Sharing</h4>
                    {suggestedClausesTemplates.assetSharing.map(sug => (
                        <Button key={sug.id} variant="outline" size="sm" className="text-xs w-full justify-start text-left h-auto py-1.5 mb-1.5 text-foreground/90 border-border hover:bg-muted/80" onClick={() => handleAddSuggestion(sug.text)}>
                         {sug.text}
                        </Button>
                    ))}
                  </div>
                  <div>
                    <h4 className="text-md font-semibold text-primary mb-1.5 flex items-center"><Users size={18} className="mr-2"/>Union Rules</h4>
                     {suggestedClausesTemplates.cohabitationRules.map(sug => (
                        <Button key={sug.id} variant="outline" size="sm" className="text-xs w-full justify-start text-left h-auto py-1.5 mb-1.5 text-foreground/90 border-border hover:bg-muted/80" onClick={() => handleAddSuggestion(sug.text)}>
                         {sug.text}
                        </Button>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t border-border">
          <DialogClose asChild>
            <Button type="button" variant="outline" className="text-foreground/90 border-border hover:bg-muted/80">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
