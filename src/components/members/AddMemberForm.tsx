
"use client";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, Save, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MemberFormData } from '@/types/member';

const formSchema = z.object({
  nome: z.string().min(2, 'O nome do membro é obrigatório e deve ter pelo menos 2 caracteres.'),
  tipoRelacao: z.string().min(1, 'O tipo de relação é obrigatório.'),
  dataNascimento: z.date().optional(),
});

interface AddMemberFormProps {
  onSubmit: (data: MemberFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}

export function AddMemberForm({ onSubmit, isLoading, onClose }: AddMemberFormProps) {
  const form = useForm<MemberFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      tipoRelacao: undefined,
      dataNascimento: undefined,
    },
    mode: "onChange",
  });

  const relationshipTypes = [
    { value: "filho_a", label: "Filho(a)" },
    { value: "pai_mae", label: "Pai/Mãe" },
    { value: "conjuge_parceiro_a", label: "Cônjuge/Parceiro(a)" },
    // { value: "esposa", label: "Esposa" }, // Adicionar condicionalmente no futuro
    { value: "outro_parente", label: "Outro Parente" },
    { value: "nao_parente", label: "Não Parente/Associado" },
  ];

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="nome">Nome Completo do Membro</Label>
        <Input id="nome" {...form.register('nome')} placeholder="Ex: Nome Sobrenome" disabled={isLoading} autoFocus/>
        {form.formState.errors.nome && <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tipoRelacao">Tipo de Relação com a União/Família</Label>
        <Controller
          name="tipoRelacao"
          control={form.control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
              <SelectTrigger id="tipoRelacao">
                <SelectValue placeholder="Selecione o tipo de relação" />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.tipoRelacao && <p className="text-sm text-destructive">{form.formState.errors.tipoRelacao.message}</p>}
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="dataNascimento">Data de Nascimento (Opcional)</Label>
        <Controller
          name="dataNascimento"
          control={form.control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={field.value ? new Date(field.value) : undefined}
                  onSelect={field.onChange}
                  initialFocus
                  locale={ptBR}
                  disabled={(date) => date > new Date() || date < new Date("1900-01-01") || isLoading}
                  captionLayout="dropdown-buttons"
                  fromYear={1900}
                  toYear={new Date().getFullYear()}
                />
              </PopoverContent>
            </Popover>
          )}
        />
        {form.formState.errors.dataNascimento && <p className="text-sm text-destructive">{form.formState.errors.dataNascimento.message}</p>}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          Adicionar Membro
        </Button>
      </div>
    </form>
  );
}
