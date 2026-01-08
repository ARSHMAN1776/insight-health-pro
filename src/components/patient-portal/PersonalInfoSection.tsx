import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { User, Calendar, Heart, Mail, Phone, Shield, CreditCard, AlertTriangle, ChevronRight, Sparkles } from 'lucide-react';
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
  const [showQRCode, setShowQRCode] = useState(false);

  const qrData = `${window.location.origin}/verify/patient?id=${patientInfo.patientId}`;

  return (
    <div className="space-y-4 pb-6">
      {/* Profile Hero Card */}
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="bg-gradient-to-br from-primary via-primary to-primary/80 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-primary-foreground/20 shadow-2xl">
                <AvatarFallback className="text-2xl sm:text-3xl bg-primary-foreground/20 text-primary-foreground font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center sm:text-left text-primary-foreground">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-primary-foreground/80 text-sm sm:text-base mb-3">
                Patient ID: {patientInfo.patientId.slice(0, 8).toUpperCase()}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/30">
                  <Shield className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
                <Badge className="bg-red-500/20 text-primary-foreground border-red-400/30">
                  <Heart className="w-3 h-3 mr-1" />
                  {patientInfo.bloodType}
                </Badge>
              </div>
            </div>

            {/* QR Code - Desktop */}
            <div className="hidden sm:flex flex-col items-center gap-2">
              <button 
                onClick={() => setShowQRCode(true)}
                className="p-3 bg-primary-foreground/10 hover:bg-primary-foreground/20 rounded-xl transition-all border border-primary-foreground/20"
              >
                <QRCodeDisplay
                  data={qrData}
                  size={72}
                  showDownload={false}
                />
              </button>
              <span className="text-[10px] text-primary-foreground/60">Tap to enlarge</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <CardContent className="p-4 bg-card">
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => setShowIDCard(true)}
              className="flex-1 h-12 rounded-xl font-semibold border-2 hover:border-primary hover:bg-primary/5 transition-all"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              View ID Card
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowQRCode(true)}
              className="sm:hidden flex-1 h-12 rounded-xl font-semibold border-2 hover:border-primary hover:bg-primary/5 transition-all"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm11-2h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2z"/>
              </svg>
              QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Contact Info */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Contact Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg">
                <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm truncate">{user?.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg">
                <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="text-sm">{user?.phone || 'Not provided'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Info */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-semibold text-sm">Medical Info</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="text-xl font-bold">{patientInfo.age}</p>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-500/10 rounded-lg text-center border border-red-100 dark:border-red-500/20">
                <p className="text-xs text-muted-foreground mb-1">Blood</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">{patientInfo.bloodType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="font-semibold text-sm">Allergies</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {patientInfo.allergies.length > 0 ? (
                patientInfo.allergies.map((allergy, index) => (
                  <Badge 
                    key={index} 
                    className="bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30 font-medium"
                  >
                    {allergy}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No known allergies</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-semibold text-sm">Emergency Contact</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg border border-emerald-100 dark:border-emerald-500/20">
              <p className="font-semibold text-sm">{patientInfo.emergencyContact.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{patientInfo.emergencyContact.relationship}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-emerald-700 dark:text-emerald-400">
                <Phone className="w-3.5 h-3.5" />
                <span>{patientInfo.emergencyContact.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ID Card Dialog */}
      <Dialog open={showIDCard} onOpenChange={setShowIDCard}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
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

      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="max-w-xs mx-4 rounded-2xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-center">Verification QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="p-4 bg-white rounded-2xl shadow-inner">
              <QRCodeDisplay
                data={qrData}
                size={200}
                showDownload={true}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Scan this code to verify your patient identity
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PersonalInfoSection;
