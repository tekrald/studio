
"use client";

import { useState, useEffect, type FormEvent } from 'react';
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
import { Input } from '@/components/ui/input';
import { Loader2, Save, Trash2, Clock } from 'lucide-react';
import type { ExtendedAssetNodeData } from '@/types/asset';
import type { MemberWithBirthDate } from '@/app/(main)/dashboard/page'; // Adjusted path

interface AssetReleaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  asset: ExtendedAssetNodeData | null;
  assignedMember: MemberWithBirthDate | null | undefined; // Member it's assigned to
  onSaveReleaseCondition: (assetId: string, targetAge: number | undefined) => void;
  isLoading?: boolean;
}

export function AssetReleaseDialog({
  isOpen,
  onClose,
  asset,
  assignedMember,
  onSaveReleaseCondition,
  isLoading = false,
}: AssetReleaseDialogProps) {
  const [targetAge, setTargetAge] = useState<string>('');

  useEffect(() => {
    if (asset?.releaseCondition?.type === 'age') {
      setTargetAge(asset.releaseCondition.targetAge.toString());
    } else {
      setTargetAge('');
    }
  }, [asset]);

  if (!asset) return null;

  const memberHasBirthDate = !!assignedMember?.dataNascimento;
  const memberName = assignedMember?.nome || 'Unknown Member';

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!memberHasBirthDate && targetAge) {
      // This case should ideally be prevented by disabling the input
      console.warn("Cannot set age condition without member's birth date.");
      return;
    }
    const age = targetAge ? parseInt(targetAge, 10) : undefined;
    if (targetAge && (isNaN(age!) || age! <= 0)) {
        alert("Please enter a valid positive age."); // Simple validation
        return;
    }
    onSaveReleaseCondition(asset.id, age);
  };

  const handleRemoveCondition = () => {
    onSaveReleaseCondition(asset.id, undefined); // Pass undefined to clear
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center">
            <Clock size={24} className="mr-2" /> Manage Release Condition
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set or remove the age-based release condition for the asset: <span className="font-semibold text-foreground">{asset.nomeAtivo}</span>.
            <br />
            Currently assigned to: <span className="font-semibold text-foreground">{memberName}</span>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="targetAge" className="text-foreground/90">
              Release at Age
            </Label>
            <Input
              id="targetAge"
              type="number"
              value={targetAge}
              onChange={(e) => setTargetAge(e.target.value)}
              placeholder="E.g., 18"
              className="bg-input text-foreground placeholder:text-muted-foreground"
              disabled={isLoading || !memberHasBirthDate}
              min="1"
            />
            {!memberHasBirthDate && (
              <p className="text-xs text-destructive">
                The assigned member ({memberName}) does not have a birth date registered. Age-based release cannot be set.
              </p>
            )}
             {memberHasBirthDate && !targetAge && asset?.releaseCondition && (
                 <p className="text-xs text-muted-foreground">
                    Clear the age to remove the condition, or enter a new age.
                </p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveCondition}
              disabled={isLoading || !asset.releaseCondition}
              className="sm:mr-auto"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
              Remove Condition
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" className="text-foreground/90 border-border hover:bg-muted/80">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || (!memberHasBirthDate && !!targetAge) || (memberHasBirthDate && targetAge === asset.releaseCondition?.targetAge.toString())}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} className="mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
