import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ADLDAPSettings } from './components/ad-ldap-settings';
import { CGServerSettings } from './components/cg-server-settings';
import { EmailSettings } from './components/email-settings';

export function SettingsView() {
  return (
    <div>
      <Tabs defaultValue="ad-ldap" className="w-full">
        <TabsList className="bg-card border-b border-border w-full justify-start rounded-none h-auto p-0">
          <TabsTrigger 
            value="ad-ldap" 
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 text-muted-foreground hover:text-foreground"
          >
            Kết nối AD/LDAP
          </TabsTrigger>
          <TabsTrigger 
            value="cg-server" 
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 text-muted-foreground hover:text-foreground"
          >
            Kết nối Server CG
          </TabsTrigger>
          <TabsTrigger 
            value="email" 
            className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3 text-muted-foreground hover:text-foreground"
          >
            Cấu hình Email
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ad-ldap" className="mt-4">
          <ADLDAPSettings />
        </TabsContent>

        <TabsContent value="cg-server" className="mt-4">
          <CGServerSettings />
        </TabsContent>

        <TabsContent value="email" className="mt-4">
          <EmailSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
