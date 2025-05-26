
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Network, Settings, PlusCircle, DollarSign, Users } from 'lucide-react';
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
      className={`w-60 shadow-xl border-2 ${selected ? 'border-primary shadow-primary/30' : 'border-primary/60'} bg-card p-0 overflow-hidden relative rounded-lg`}
      style={{ overflow: 'visible' }}
    >
      <Handle type="target" position={Position.Top} id={`t-${id}-top`} className="!opacity-0" />

      <div className="bg-gradient-to-r from-gradient-green to-gradient-blue p-2 rounded-t-md flex justify-between items-center">
        <span className="text-xs font-semibold text-black">Contrato</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-black hover:bg-white/20 hover:text-black/80"
          onClick={data.onSettingsClick}
          aria-label="Configurações do Contrato"
        >
          <Settings size={16} />
        </Button>
      </div>

      <div className="p-3 bg-card rounded-b-md">
        <div className="flex items-center space-x-2 text-sm font-semibold text-card-foreground">
          <Network size={18} className="text-primary" />
          <span>{data.label}</span>
        </div>
      </div>

      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-10">
        <button
          id={`handle-plus-${id}`}
          onClick={toggleActions}
          className="p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center justify-center"
          aria-label="Adicionar"
          style={{ width: '32px', height: '32px' }}
        >
          <PlusCircle size={20} />
        </button>
        {showActions && (
          <div
            ref={popoverRef}
            className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-popover border border-border rounded-md shadow-xl p-2 space-y-2 z-20"
            style={{ top: 'calc(100% + 0.5rem)' }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-sm text-popover-foreground hover:bg-primary/20 hover:text-primary"
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
              className="w-full justify-start text-sm text-popover-foreground hover:bg-accent/20 hover:text-accent"
              onClick={() => {
                data.onAddMember();
                setShowActions(false);
              }}
            >
              <Users size={16} className="mr-2" />
              Adicionar Filho(a)
            </Button>
          </div>
        )}
      </div>
       <Handle
        type="source"
        position={Position.Bottom}
        id={`s-${id}-bottom`}
        className="!opacity-0 !w-px !h-px !cursor-default"
        isConnectable={false}
      />
    </Card>
  );
}
