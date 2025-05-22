
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Network, Settings, PlusCircle, DollarSign, Users } from 'lucide-react'; // Plus alterado para PlusCircle
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState, useCallback, useEffect, useRef } from 'react';

export type UnionNodeData = {
  label: string;
  onSettingsClick: () => void; 
  onOpenAssetModal: () => void;
  onAddMember: () => void;
};

export function UnionNode({ id, data, selected }: NodeProps<UnionNodeData>) {
  const [showActions, setShowActions] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggleActions = useCallback(() => {
    setShowActions((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        const handleElement = document.getElementById(`handle-plus-${id}`);
        if (handleElement && handleElement.contains(event.target as Node)) {
          // Não feche se o clique foi no próprio botão "+"
          return;
        }
        setShowActions(false);
      }
    };

    if (showActions) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActions, id]);


  return (
    <Card 
      className={`w-60 shadow-xl border-2 ${selected ? 'border-primary shadow-primary/50' : 'border-primary/60'} bg-card p-0 overflow-hidden relative`}
      style={{ overflow: 'visible' }} // Permite que o popover não seja cortado
    >
      {/* Alça superior invisível para conexões de entrada */}
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      
      {/* Header Interno Colorido */}
      <div className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] p-2 rounded-t-md flex justify-between items-center">
        <span className="text-xs font-semibold text-white">Contrato</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/20 hover:text-white hover:opacity-75"
          onClick={data.onSettingsClick} 
          aria-label="Configurações do Contrato"
        >
          <Settings size={16} />
        </Button>
      </div>

      {/* Corpo do Nó */}
      <div className="p-3 bg-card rounded-b-md"> {/* Adicionado rounded-b-md aqui */}
        <div className="flex items-center space-x-2 text-sm font-semibold text-card-foreground">
          <Network size={18} className="text-primary" />
          <span>{data.label}</span>
        </div>
      </div>

      {/* Botão Flutuante "+" e Popover de Ações */}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-10">
        <button
          id={`handle-plus-${id}`} // ID para referência no handleClickOutside
          onClick={toggleActions}
          className="p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center justify-center"
          aria-label="Adicionar"
          style={{ width: '32px', height: '32px' }} // Garante tamanho do círculo
        >
          <PlusCircle size={20} /> {/* Ícone PlusCircle */}
        </button>
        {showActions && (
          <div
            ref={popoverRef}
            className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-popover border border-border rounded-md shadow-xl p-2 space-y-2 z-20"
            style={{ bottom: 'calc(100% + 0.5rem)' }} // Posiciona acima do botão '+'
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => {
                data.onOpenAssetModal();
                setShowActions(false);
              }}
            >
              <DollarSign size={16} className="mr-2" />
              Adicionar Ativo
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm"
              onClick={() => {
                data.onAddMember();
                setShowActions(false);
              }}
            >
              <Users size={16} className="mr-2" />
              Adicionar Membro
            </Button>
          </div>
        )}
      </div>
       {/* Alça inferior invisível para conexões de saída principal */}
       <Handle 
        type="source" 
        position={Position.Bottom} 
        id={`handle-source-invisible-${id}`} 
        className="!opacity-0 !w-px !h-px !cursor-default" // Torna invisível e não funcional para conexão manual direta
        isConnectable={false} // Importante para não permitir conexões manuais diretas nesta alça se o "+" controla
      />
    </Card>
  );
}
