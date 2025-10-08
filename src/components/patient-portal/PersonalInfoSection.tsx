import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { User, Calendar, Heart, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';

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
  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="card-gradient overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary-hover p-8 text-primary-foreground">
          <div className="flex items-center space-x-6">
            <Avatar className="w-24 h-24 border-4 border-primary-foreground/20">
              <AvatarFallback className="text-3xl bg-primary-foreground/10 text-primary-foreground">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-1">{user?.firstName} {user?.lastName}</h2>
              <p className="text-primary-foreground/80 text-lg">Patient ID: {patientInfo.patientId}</p>
            </div>
            <Badge variant="outline" className="bg-primary-foreground/20 border-primary-foreground/40 text-primary-foreground text-sm px-4 py-2">
              Active Patient
            </Badge>
          </div>
        </div>
      </Card>

      {/* Personal Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-medical-red" />
              <span>Medical Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Age</p>
                <p className="font-medium">{patientInfo.age} years</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Heart className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Blood Type</p>
                <p className="font-medium">{patientInfo.bloodType}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-warning" />
              <span>Allergies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {patientInfo.allergies.length > 0 ? (
                patientInfo.allergies.map((allergy, index) => (
                  <Badge key={index} variant="outline" className="bg-warning/10 text-warning border-warning/20">
                    {allergy}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No known allergies</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="card-gradient">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5 text-medical-green" />
              <span>Emergency Contact</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{patientInfo.emergencyContact.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Relationship</p>
              <p className="font-medium">{patientInfo.emergencyContact.relationship}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{patientInfo.emergencyContact.phone}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
