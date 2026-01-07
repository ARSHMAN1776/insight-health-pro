import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Calendar, Heart, Mail, Phone, Shield, CreditCard, QrCode, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import PatientIDCard from '../patients/PatientIDCard';
import QRCodeDisplay from '../shared/QRCodeDisplay';

interface PersonalInfoProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  patientInfo: {
    patientId: string;
    age: number;
    bloodType: string;
    allergies: string[];
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
  };
}

const PersonalInfoSection: React.FC<PersonalInfoProps> = ({ user, patientInfo }) => {
  const [showIDCard, setShowIDCard] = useState(false);

  const qrData = `${window.location.origin}/verify/patient?id=${patientInfo.patientId}`;

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-primary/20">
              <AvatarFallback className="text-lg sm:text-xl bg-primary/10 text-primary font-semibold">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold truncate">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                ID: {patientInfo.patientId.slice(0, 8).toUpperCase()}
              </p>
              <Badge variant="outline" className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                Active Patient
              </Badge>
            </div>

            <div className="flex flex-col items-center gap-2">
              <QRCodeDisplay
                data={qrData}
                size={64}
                showDownload={false}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowIDCard(true)}
                className="text-xs h-8"
              >
                <CreditCard className="w-3 h-3 mr-1.5" />
                View ID
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Contact */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="truncate">{user?.email || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{user?.phone || 'Not provided'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Medical */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" />
              Medical
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Age</span>
              <span className="font-medium">{patientInfo.age} years</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Blood Type</span>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-xs">
                {patientInfo.bloodType}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="flex flex-wrap gap-1.5">
              {patientInfo.allergies.length > 0 ? (
                patientInfo.allergies.map((allergy, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs"
                  >
                    {allergy}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">None reported</span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 space-y-1">
            <p className="text-sm font-medium">{patientInfo.emergencyContact.name}</p>
            <p className="text-xs text-muted-foreground">{patientInfo.emergencyContact.relationship}</p>
            <p className="text-sm">{patientInfo.emergencyContact.phone}</p>
          </CardContent>
        </Card>
      </div>

      {/* ID Card Dialog */}
      <Dialog open={showIDCard} onOpenChange={setShowIDCard}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Patient ID Card
            </DialogTitle>
          </DialogHeader>
          <PatientIDCard
            patient={{
              id: patientInfo.patientId,
              firstName: user?.firstName || '',
              lastName: user?.lastName || '',
              bloodType: patientInfo.bloodType,
              allergies: patientInfo.allergies.join(', '),
              emergencyContactName: patientInfo.emergencyContact.name,
              emergencyContactPhone: patientInfo.emergencyContact.phone,
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalInfoSection;
