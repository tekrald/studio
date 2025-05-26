
"use client";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { MemberFormData } from '@/types/member';

const formSchema = z.object({
  nome: z.string().min(2, 'O nome do filho(a) é obrigatório e deve ter pelo menos 2 caracteres.'),
  dataNascimento: z.date({ required_error: "A data de nascimento é obrigatória." }),
});

interface AddMemberFormProps {
  onSubmit: (data: MemberFormData) => Promise<void>;
  isLoading: boolean;
  onClose: () => void;
}

export function AddMemberForm({ onSubmit, isLoading, onClose }: AddMemberFormProps) {
  const form = useForm<Omit<MemberFormData, 'tipoRelacao'>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      dataNascimento: undefined,
    },
    mode: "onChange",
  });

  const handleFormSubmit = (values: Omit<MemberFormData, 'tipoRelacao'>) => {
    const formDataWithRelation: MemberFormData = {
      ...values,
      tipoRelacao: 'filho_a',
    };
    onSubmit(formDataWithRelation);
  };

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="nome" className="text-foreground/90">Nome Completo do Filho(a)</Label>
        <Input id="nome" {...form.register('nome')} placeholder="Ex: Nome Sobrenome" disabled={isLoading} autoFocus className="bg-input text-foreground placeholder:text-muted-foreground"/>
        {form.formState.errors.nome && <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>}
      </div>
      
      <div className="space-y-1.5">
        <Label htmlFor="dataNascimento" className="text-foreground/90">Data de Nascimento</Label>
        <Controller
          name="dataNascimento"
          control={form.control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input text-foreground hover:bg-input/80",
                    !field.value && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(new Date(field.value), "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-popover border-border">
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
        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading} className="text-foreground/90 border-border hover:bg-muted/80">
          Cancelar
        </Button>
        <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
          Adicionar Filho(a)
        </Button>
      </div>
    </form>
  );
}
