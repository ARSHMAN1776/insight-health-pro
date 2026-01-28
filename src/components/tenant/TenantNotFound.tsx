import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ArrowLeft, Search } from 'lucide-react';

interface TenantNotFoundProps {
  subdomain?: string | null;
}

const TenantNotFound: React.FC<TenantNotFoundProps> = ({ subdomain }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="max-w-md w-full shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Building2 className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Organization Not Found
          </h1>
          
          <p className="text-muted-foreground mb-6">
            {subdomain ? (
              <>
                We couldn't find a hospital portal for <strong className="text-foreground">"{subdomain}"</strong>. 
                Please check the URL and try again.
              </>
            ) : (
              <>
                The hospital portal you're looking for doesn't exist or may have been deactivated.
              </>
            )}
          </p>
          
          <div className="space-y-3">
            <Button 
              variant="default"
              className="w-full"
              onClick={() => window.location.href = 'https://insight-health-pro.lovable.app'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Main Site
            </Button>
            
            <Button 
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = 'https://insight-health-pro.lovable.app/contact'}
            >
              <Search className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-6">
            Are you a healthcare provider?{' '}
            <a 
              href="https://insight-health-pro.lovable.app/onboarding"
              className="text-primary font-medium hover:underline"
            >
              Register your organization
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantNotFound;
