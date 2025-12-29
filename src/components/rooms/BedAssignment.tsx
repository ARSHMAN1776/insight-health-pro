import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bed, User, Calendar, Plus, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { dataManager, Patient, Room } from '@/lib/dataManager';

const assignmentSchema = z.object({
  room_id: z.string().min(1, 'Room is required'),
  patient_id: z.string().min(1, 'Patient is required'),
  bed_number: z.number().min(1, 'Bed number is required'),
  admission_date: z.string().min(1, 'Admission date is required'),
  admission_reason: z.enum(['general', 'post_surgery', 'emergency', 'observation', 'planned']),
  surgery_id: z.string().optional(),
  notes: z.string().optional(),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface RoomAssignment {
  id: string;
  room_id: string;
  patient_id: string;
  bed_number: number;
  admission_date: string;
  discharge_date?: string;
  status: string;
  admission_reason?: string;
  surgery_id?: string;
  notes?: string;
  room?: Room;
  patient?: Patient;
}

interface Surgery {
  id: string;
  surgery_type: string;
  surgery_date: string;
  patient_id: string;
  status: string;
}

const BedAssignment: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<RoomAssignment[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [completedSurgeries, setCompletedSurgeries] = useState<Surgery[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      room_id: '',
      patient_id: '',
      bed_number: 1,
      admission_date: new Date().toISOString().split('T')[0],
      admission_reason: 'general',
      surgery_id: '',
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load rooms
      const roomsData = await dataManager.getRooms();
      setRooms(roomsData);

      // Load patients (only active ones for assignment)
      const patientsData = await dataManager.getPatients();
      setPatients(patientsData.filter(p => p.status === 'active'));

      // Load completed surgeries without room assignment
      const { data: surgeriesData } = await supabase
        .from('surgeries')
        .select('id, surgery_type, surgery_date, patient_id, status')
        .eq('status', 'Completed');

      // Get surgeries that already have room assignments
      const { data: existingAssignments } = await supabase
        .from('room_assignments')
        .select('surgery_id')
        .not('surgery_id', 'is', null);

      const assignedSurgeryIds = existingAssignments?.map(a => a.surgery_id) || [];
      const unassignedSurgeries = (surgeriesData || []).filter(
        s => !assignedSurgeryIds.includes(s.id)
      );
      setCompletedSurgeries(unassignedSurgeries as Surgery[]);

      // Load active assignments
      const { data: assignmentsData } = await supabase
        .from('room_assignments')
        .select('*')
        .eq('status', 'active')
        .order('admission_date', { ascending: false });

      // Enrich assignments with room and patient data
      const enrichedAssignments = await Promise.all(
        (assignmentsData || []).map(async (assignment) => {
          const room = roomsData.find(r => r.id === assignment.room_id);
          const patient = patientsData.find(p => p.id === assignment.patient_id);
          return { ...assignment, room, patient };
        })
      );

      setAssignments(enrichedAssignments);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBeds = (room: Room | null) => {
    if (!room) return [];
    
    const occupiedBeds = assignments
      .filter(a => a.room_id === room.id && a.status === 'active')
      .map(a => a.bed_number);
    
    const allBeds = Array.from({ length: room.capacity }, (_, i) => i + 1);
    return allBeds.filter(bed => !occupiedBeds.includes(bed));
  };

  const handleSubmit = async (data: AssignmentFormData) => {
    try {
      const { error } = await supabase
        .from('room_assignments')
        .insert([{
          room_id: data.room_id,
          patient_id: data.patient_id,
          bed_number: data.bed_number,
          admission_date: data.admission_date,
          admission_reason: data.admission_reason,
          surgery_id: data.surgery_id || null,
          notes: data.notes,
          assigned_by: user?.id,
        }]);

      if (error) throw error;

      // Update room occupancy
      const room = rooms.find(r => r.id === data.room_id);
      if (room) {
        await supabase
          .from('rooms')
          .update({ 
            current_occupancy: (room.current_occupancy || 0) + 1,
            status: (room.current_occupancy || 0) + 1 >= room.capacity ? 'occupied' : room.status
          })
          .eq('id', data.room_id);
      }

      toast({
        title: 'Success',
        description: 'Patient assigned to bed successfully',
      });

      setIsDialogOpen(false);
      form.reset();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to assign patient',
        variant: 'destructive',
      });
    }
  };

  const handleDischarge = async (assignment: RoomAssignment) => {
    try {
      const { error } = await supabase
        .from('room_assignments')
        .update({
          status: 'discharged',
          discharge_date: new Date().toISOString().split('T')[0],
        })
        .eq('id', assignment.id);

      if (error) throw error;

      // Update room occupancy
      const room = rooms.find(r => r.id === assignment.room_id);
      if (room) {
        const newOccupancy = Math.max(0, (room.current_occupancy || 1) - 1);
        await supabase
          .from('rooms')
          .update({ 
            current_occupancy: newOccupancy,
            status: newOccupancy === 0 ? 'available' : room.status
          })
          .eq('id', assignment.room_id);
      }

      toast({
        title: 'Success',
        description: 'Patient discharged successfully',
      });

      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to discharge patient',
        variant: 'destructive',
      });
    }
  };

  // Get patients not currently assigned
  const availablePatients = patients.filter(
    p => !assignments.some(a => a.patient_id === p.id && a.status === 'active')
  );

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Bed Assignment</h2>
          <p className="text-muted-foreground">Manage patient bed assignments</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Assign Patient to Bed
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Bed className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Beds</p>
                <p className="text-2xl font-bold">
                  {rooms.reduce((sum, r) => sum + (r.capacity || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Occupied</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Bed className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-2xl font-bold">
                  {rooms.reduce((sum, r) => sum + (r.capacity || 0), 0) - assignments.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rooms</p>
                <p className="text-2xl font-bold">{rooms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Bed Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active bed assignments
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Bed #</TableHead>
                  <TableHead>Admission Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell>
                      <div className="font-medium">
                        {assignment.patient?.first_name} {assignment.patient?.last_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {assignment.room?.room_number} ({assignment.room?.room_type})
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Bed {assignment.bed_number}</Badge>
                    </TableCell>
                    <TableCell>{assignment.admission_date}</TableCell>
                    <TableCell>
                      <Badge variant={assignment.admission_reason === 'post_surgery' ? 'default' : 'secondary'}>
                        {assignment.admission_reason === 'post_surgery' ? 'Post-Surgery' :
                         assignment.admission_reason === 'emergency' ? 'Emergency' :
                         assignment.admission_reason === 'observation' ? 'Observation' :
                         assignment.admission_reason === 'planned' ? 'Planned' : 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500 text-white">Active</Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDischarge(assignment)}
                      >
                        <LogOut className="h-4 w-4 mr-1" />
                        Discharge
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Patient to Bed</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="patient_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availablePatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.first_name} {patient.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        const room = rooms.find(r => r.id === value);
                        setSelectedRoom(room || null);
                        const beds = getAvailableBeds(room || null);
                        if (beds.length > 0) {
                          form.setValue('bed_number', beds[0]);
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rooms
                          .filter(r => r.status !== 'maintenance' && (r.current_occupancy || 0) < r.capacity)
                          .map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              {room.room_number} - {room.room_type} ({room.capacity - (room.current_occupancy || 0)} beds available)
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bed_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bed Number</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select bed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableBeds(selectedRoom).map((bed) => (
                          <SelectItem key={bed} value={bed.toString()}>
                            Bed {bed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admission_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="admission_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admission Reason</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      // If post-surgery, show surgery selection
                      if (value !== 'post_surgery') {
                        form.setValue('surgery_id', '');
                      }
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general">General Admission</SelectItem>
                        <SelectItem value="post_surgery">Post-Surgery Recovery</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="observation">Observation</SelectItem>
                        <SelectItem value="planned">Planned Procedure</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('admission_reason') === 'post_surgery' && (
                <FormField
                  control={form.control}
                  name="surgery_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link to Surgery</FormLabel>
                      <Select onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-select patient from surgery
                        const surgery = completedSurgeries.find(s => s.id === value);
                        if (surgery) {
                          form.setValue('patient_id', surgery.patient_id);
                        }
                      }} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select completed surgery" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {completedSurgeries.map((surgery) => {
                            const patient = patients.find(p => p.id === surgery.patient_id);
                            return (
                              <SelectItem key={surgery.id} value={surgery.id}>
                                {surgery.surgery_type} - {patient?.first_name} {patient?.last_name} ({surgery.surgery_date})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Assign</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BedAssignment;
