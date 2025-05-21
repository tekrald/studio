
export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} domedome. Todos os direitos reservados.</p>
        <p>Feito com <span className="text-primary">&hearts;</span> para o seu dia especial.</p>
      </div>
    </footer>
  );
}
