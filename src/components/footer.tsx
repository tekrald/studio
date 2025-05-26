
export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Acta Ipê. Todos os direitos reservados.</p>
        <p>Registros para Ipê City.</p>
      </div>
    </footer>
  );
}
