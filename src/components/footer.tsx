export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} domedome. All rights reserved.</p>
        <p>Made with <span className="text-primary">&hearts;</span> for your special day.</p>
      </div>
    </footer>
  );
}
