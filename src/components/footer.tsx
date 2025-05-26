
export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Ipê Acta. All rights reserved.</p>
        <p>Contracts and asset management for your union.</p>
      </div>
    </footer>
  );
}
