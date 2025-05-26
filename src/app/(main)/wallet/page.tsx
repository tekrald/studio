
"use client";
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Wallet, LogOut, RefreshCw, ListChecks, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

// Simple SVG icons for coins (can be replaced with more detailed ones or images)
const BitcoinIconSvg = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><circle cx="12" cy="12" r="10" fill="#F7931A"/><path d="M10.05 16.64H12.32C14.66 16.64 16.31 15.32 16.31 12.91C16.31 10.5 14.66 9.17999 12.32 9.17999H10.05V7.35999H12.4C15.43 7.35999 17.5 8.95999 17.5 11.82C17.5 13.48 16.73 14.91 15.38 15.79V15.83C17.06 16.57 18 17.97 18 19.76C18 22.79 15.67 24.48 12.54 24.48H8V7.35999H10.05V16.64ZM10.05 11.6H12.22C13.6 11.6 14.51 12.31 14.51 13.59C14.51 14.87 13.6 15.58 12.22 15.58H10.05V11.6ZM10.05 17.68H12.4C13.98 17.68 15.03 18.46 15.03 19.79C15.03 21.12 13.98 21.9 12.4 21.9H10.05V17.68Z" fill="white" transform="scale(0.75) translate(2, -4)"/></svg>;
const EthereumIconSvg = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2"><path d="M12.023 2.68701L11.531 3.32701V11.56L12.023 11.829L12.516 11.56V3.32701L12.023 2.68701Z" fill="#627EEA"/><path d="M12.023 2.68701L6.78101 9.40401L12.023 11.829V2.68701Z" fill="#8AA1F2"/><path d="M12.023 2.68701L17.265 9.40401L12.023 11.829V2.68701Z" fill="#627EEA"/><path d="M12.023 12.76L11.555 12.981V16.844L12.023 17.13L12.492 16.844V12.981L12.023 12.76Z" fill="#627EEA"/><path d="M12.023 17.13V12.76L6.78101 10.352L12.023 17.13Z" fill="#8AA1F2"/><path d="M12.023 17.13V12.76L17.265 10.352L12.023 17.13Z" fill="#627EEA"/><path d="M12.023 11.829L17.265 9.40401L12.023 6.99701L6.78101 9.40401L12.023 11.829Z" fill="#45578E"/></svg>;
const UsdcIconSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
    <circle cx="12" cy="12" r="10" fill="#2775CA"/>
    <path d="M12 17.5C14.7614 17.5 17 15.2614 17 12.5C17 9.73858 14.7614 7.5 12 7.5C9.23858 7.5 7 9.73858 7 12.5C7 13.8462 7.51211 15.0739 8.36341 15.9697M12 17.5C9.23858 17.5 7 15.2614 7 12.5M12 17.5V14.5M7 12.5H10M12 7.5V10.5M17 12.5H14M12.5 10H11.5L10.5 11L11.5 12L12.5 11L13.5 12L14.5 11L13.5 10H12.5Z" stroke="white" strokeWidth="1.5"/>
  </svg>
);

const simulatedWalletAssets = [
  { name: 'Bitcoin', symbol: 'BTC', quantity: 0.5, icon: <BitcoinIconSvg /> },
  { name: 'Ethereum', symbol: 'ETH', quantity: 10, icon: <EthereumIconSvg /> },
  { name: 'USDC', symbol: 'USDC', quantity: 5000, icon: <UsdcIconSvg /> }, // This represents the total potential wallet amount
];

export default function WalletPage() {
  const { user, updateProfile, loading } = useAuth();
  const { toast } = useToast();

  const handleDisconnectWallet = () => {
    updateProfile({
      isWalletConnected: false,
      connectedWalletAddress: null,
    });
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected from Ipê Acta.',
    });
  };

  const handleChangeWallet = () => {
    toast({
      title: 'Change Wallet (Simulated)',
      description: 'Functionality to change wallet will be implemented. For now, disconnect and connect a new one during signup if needed.',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-var(--header-height,100px)-2rem)] items-center justify-center">
        <Wallet className="h-12 w-12 animate-pulse text-primary" />
        <p className="mt-2 text-muted-foreground">Loading Wallet Information...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card className="shadow-xl bg-card border-border">
        <CardHeader>
          <div className="flex items-center mb-4">
            <Wallet className="h-10 w-10 text-primary mr-4" />
            <div>
              <CardTitle className="text-3xl text-foreground">Wallet Management</CardTitle>
              <CardDescription className="text-muted-foreground">
                View your connected wallet status and assets (simulated).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {user?.isWalletConnected && user.connectedWalletAddress ? (
            <>
              <div className="p-4 border rounded-md bg-accent/10 border-accent/30 text-accent">
                <p className="font-semibold">Wallet Connected!</p>
                <p className="text-sm break-all">Address: {user.connectedWalletAddress}</p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-foreground mb-3">Simulated Wallet Assets</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  These assets are simulated based on a connected wallet. Actual balances would be fetched from the blockchain.
                  The USDC amount represents a general reserve; specific allocations to children are managed on the contract dashboard.
                </p>
                <div className="space-y-3">
                  {simulatedWalletAssets.map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-3 bg-muted/50 rounded-md border border-border/50">
                      <div className="flex items-center">
                        {asset.icon}
                        <span className="font-medium text-foreground">{asset.name} ({asset.symbol})</span>
                      </div>
                      <span className="text-foreground/90">{asset.quantity.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:8})}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button onClick={handleDisconnectWallet} variant="outline" className="w-full sm:w-auto text-destructive border-destructive hover:bg-destructive/10">
                  <LogOut className="mr-2" /> Disconnect Wallet
                </Button>
                <Button onClick={handleChangeWallet} variant="outline" className="w-full sm:w-auto text-foreground/90 border-border hover:bg-muted/80">
                  <RefreshCw className="mr-2" /> Change Wallet (Simulated)
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No wallet is currently connected to your Ipê Acta record.</p>
              <p className="text-sm text-muted-foreground">
                You can connect a wallet during the <Link href="/signup" className="text-accent hover:underline">signup process</Link>.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-xl bg-card border-border">
        <CardHeader>
            <CardTitle className="text-2xl text-foreground flex items-center"><ShieldCheck className="mr-3 text-primary h-7 w-7"/> Data Sharing & Privacy</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                Ipê Acta's wallet connection is currently simulated. When fully implemented, connecting your wallet will only grant read-only access to view public asset balances. Ipê Acta will never ask for your private keys or seed phrases.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
                All transactions requiring your approval (e.g., moving assets) would always be confirmed and signed by you directly in your wallet application.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

    