
'use client';

import type { NodeProps } from 'reactflow';
import { Handle, Position } from 'reactflow';
import { Network, Settings, Plus, DollarSign, Users } from 'lucide-react';
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
          // Click was on the handle itself, toggle handles it
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
      style={{ overflow: 'visible' }} // Ensure popover is not clipped
    >
      {/* Invisible handles for standard connections if needed later */}
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      
      {/* Colored Header */}
      <div className="bg-gradient-to-r from-[hsl(var(--gradient-pink))] to-[hsl(var(--gradient-orange))] p-2 rounded-t-md flex justify-between items-center">
        <span className="text-xs font-semibold text-white">Contrato</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-white hover:bg-white/20 hover:text-white"
          onClick={data.onSettingsClick}
          aria-label="Configurações da União"
        >
          <Settings size={16} />
        </Button>
      </div>

      {/* Main Content */}
      <div className="p-3 bg-card">
        <div className="flex items-center space-x-2 text-sm font-semibold text-card-foreground">
          <Network size={18} className="text-primary" />
          <span>{data.label}</span>
        </div>
      </div>

      {/* Custom '+' Handle and Popover for Actions */}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 z-10">
        <button
          id={`handle-plus-${id}`}
          onClick={toggleActions}
          className="p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex items-center justify-center"
          aria-label="Adicionar"
          style={{ width: '32px', height: '32px' }}
        >
          <Plus size={20} />
        </button>
        {showActions && (
          <div
            ref={popoverRef}
            className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-popover border border-border rounded-md shadow-xl p-2 space-y-2 z-20"
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
      {/* Invisible source handle at bottom, actual connections will be from the custom popover actions */}
       <Handle 
        type="source" 
        position={Position.Bottom} 
        id={`handle-source-invisible-${id}`} 
        className="!opacity-0 !w-px !h-px !cursor-default"
        isConnectable={false} // Set to false as actual logic is via buttons
      />
    </Card>
  );
}
