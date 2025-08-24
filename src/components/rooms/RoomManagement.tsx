import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Filter, Bed, MapPin, Users, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import DataTable from '../shared/DataTable';
import ConfirmDialog from '../shared/ConfirmDialog';
import { dataManager } from '../../lib/dataManager';
import { useToast } from '../../hooks/use-toast';

// Schema with validation
const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  roomType: z.enum(['ICU', 'General', 'Private', 'Semi-Private', 'Emergency', 'Surgery', 'Pediatric', 'Maternity']),
  floor: z.string().min(1, 'Floor is required'),
  department: z.string().min(1, 'Department is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1').max(10, 'Capacity cannot exceed 10'),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']),
  features: z.array(z.string()).optional(),
  dailyRate: z.number().min(0, 'Daily rate must be positive'),
  description: z.string().optional(),
  hasOxygen: z.boolean().optional(),
  hasMonitor: z.boolean().optional(),
  isAccessible: z.boolean().optional(),
});

type RoomFormData = z.infer<typeof roomSchema>;

const RoomManagement: React.FC = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomNumber: '',
      roomType: 'General',
      floor: '',
      department: '',
      capacity: 1,
      status: 'available',
      features: [],
      dailyRate: 0,
      description: '',
      hasOxygen: false,
      hasMonitor: false,
      isAccessible: false,
    },
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const roomsData = await dataManager.getRooms();
      setRooms(roomsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load rooms",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: RoomFormData) => {
    try {
      if (selectedRoom) {
        await dataManager.updateRoom(selectedRoom.id, data as any);
        toast({
          title: "Success",
          description: "Room updated successfully",
        });
      } else {
        await dataManager.createRoom(data as any);
        toast({
          title: "Success",
          description: "Room created successfully",
        });
      }
      
      setIsDialogOpen(false);
      setSelectedRoom(null);
      form.reset();
      loadRooms();
    } catch (error) {
      toast({
        title: "Error",
        description: selectedRoom ? "Failed to update room" : "Failed to create room",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (room: any) => {
    setSelectedRoom(room);
    form.reset({
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      floor: room.floor,
      department: room.department,
      capacity: room.capacity,
      status: room.status,
      features: room.features || [],
      dailyRate: room.dailyRate,
      description: room.description || '',
      hasOxygen: room.hasOxygen || false,
      hasMonitor: room.hasMonitor || false,
      isAccessible: room.isAccessible || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (roomId: string) => {
    try {
      await dataManager.deleteRoom(roomId);
      toast({
        title: "Success",
        description: "Room deleted successfully",
      });
      loadRooms();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'available': return 'default';
      case 'occupied': return 'destructive';
      case 'maintenance': return 'secondary';
      case 'cleaning': return 'outline';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'occupied': return XCircle;
      case 'maintenance': return Clock;
      case 'cleaning': return Clock;
      default: return CheckCircle;
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || room.roomType === filterType;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate stats
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;

  const columns = [
    {
      key: 'roomNumber',
      label: 'Room Number',
      sortable: true,
      render: (room: any) => (
        <div className="flex items-center space-x-2">
          <Bed className="h-4 w-4 text-medical-blue" />
          <span className="font-semibold text-medical-blue">{room.roomNumber}</span>
        </div>
      )
    },
    {
      key: 'roomType',
      label: 'Type',
      sortable: true,
      render: (room: any) => (
        <Badge variant="outline" className="bg-medical-blue-light text-medical-blue border-medical-blue">
          {room.roomType}
        </Badge>
      )
    },
    {
      key: 'floor',
      label: 'Floor',
      sortable: true,
      render: (room: any) => (
        <div className="flex items-center space-x-1">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>{room.floor}</span>
        </div>
      )
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
    },
    {
      key: 'capacity',
      label: 'Capacity',
      sortable: true,
      render: (room: any) => (
        <div className="flex items-center space-x-1">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span>{room.capacity}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (room: any) => {
        const StatusIcon = getStatusIcon(room.status);
        return (
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-4 w-4" />
            <Badge variant={getStatusBadgeVariant(room.status)}>
              {room.status}
            </Badge>
          </div>
        );
      }
    },
    {
      key: 'dailyRate',
      label: 'Daily Rate',
      sortable: true,
      render: (room: any) => `$${(room.dailyRate || 0).toFixed(2)}`
    },
  ];

  const roomFeatures = [
    'Air Conditioning', 'TV', 'WiFi', 'Bathroom', 'Balcony', 'Mini Fridge', 
    'Phone', 'Safe', 'Wardrobe', 'Reading Light'
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Room & Bed Management</h1>
          <p className="text-muted-foreground mt-1">Manage hospital rooms, beds, and facilities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary" onClick={() => { setSelectedRoom(null); form.reset(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl text-medical-blue">
                {selectedRoom ? 'Edit Room' : 'Add New Room'}
              </DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <Card className="card-gradient">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-medical-blue flex items-center">
                      <Bed className="h-5 w-5 mr-2" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Styled Input Field */}
                      <FormField
                        control={form.control}
                        name="roomNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-medical-blue font-semibold">Room Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter room number"
                                className="border-2 border-medical-blue/20 focus:border-medical-blue rounded-xl bg-medical-blue-light/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Styled Select Field */}
                      <FormField
                        control={form.control}
                        name="roomType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-medical-green font-semibold">Room Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="border-2 border-medical-green/20 focus:border-medical-green rounded-xl bg-medical-green-light/30">
                                  <SelectValue placeholder="Select room type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="ICU">ICU</SelectItem>
                                <SelectItem value="General">General</SelectItem>
                                <SelectItem value="Private">Private</SelectItem>
                                <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                                <SelectItem value="Emergency">Emergency</SelectItem>
                                <SelectItem value="Surgery">Surgery</SelectItem>
                                <SelectItem value="Pediatric">Pediatric</SelectItem>
                                <SelectItem value="Maternity">Maternity</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Styled Input with Icon */}
                      <FormField
                        control={form.control}
                        name="floor"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-medical-purple font-semibold">Floor</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-purple" />
                                <Input 
                                  {...field} 
                                  placeholder="e.g., 1st Floor"
                                  className="pl-10 border-2 border-medical-purple/20 focus:border-medical-purple rounded-xl bg-medical-purple-light/30"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="department"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-medical-orange font-semibold">Department</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter department"
                                className="border-2 border-medical-orange/20 focus:border-medical-orange rounded-xl bg-medical-orange-light/30"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-medical-red font-semibold">Capacity</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-red" />
                                <Input 
                                  {...field} 
                                  type="number"
                                  placeholder="Number of beds"
                                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  className="pl-10 border-2 border-medical-red/20 focus:border-medical-red rounded-xl bg-medical-red-light/30"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Status and Pricing Section */}
                <Card className="card-gradient">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-medical-green flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Status & Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Radio Group for Status */}
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-medical-green font-semibold">Room Status</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="grid grid-cols-2 gap-2"
                              >
                                <div className="flex items-center space-x-2 p-3 border-2 border-success/20 rounded-lg bg-success/5">
                                  <RadioGroupItem value="available" id="available" />
                                  <Label htmlFor="available" className="text-success font-medium">Available</Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border-2 border-destructive/20 rounded-lg bg-destructive/5">
                                  <RadioGroupItem value="occupied" id="occupied" />
                                  <Label htmlFor="occupied" className="text-destructive font-medium">Occupied</Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border-2 border-warning/20 rounded-lg bg-warning/5">
                                  <RadioGroupItem value="maintenance" id="maintenance" />
                                  <Label htmlFor="maintenance" className="text-warning font-medium">Maintenance</Label>
                                </div>
                                <div className="flex items-center space-x-2 p-3 border-2 border-info/20 rounded-lg bg-info/5">
                                  <RadioGroupItem value="cleaning" id="cleaning" />
                                  <Label htmlFor="cleaning" className="text-info font-medium">Cleaning</Label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dailyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-medical-blue font-semibold">Daily Rate ($)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                className="border-2 border-medical-blue/20 focus:border-medical-blue rounded-xl bg-medical-blue-light/30 text-lg font-semibold"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Features Section */}
                <Card className="card-gradient">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-medical-purple flex items-center">
                      <Calendar className="h-5 w-5 mr-2" />
                      Room Features & Amenities
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Switch Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="hasOxygen"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border-2 border-medical-blue/20 rounded-xl bg-medical-blue-light/20">
                            <div>
                              <FormLabel className="text-medical-blue font-semibold">Oxygen Supply</FormLabel>
                              <p className="text-sm text-muted-foreground">Medical oxygen available</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hasMonitor"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border-2 border-medical-green/20 rounded-xl bg-medical-green-light/20">
                            <div>
                              <FormLabel className="text-medical-green font-semibold">Patient Monitor</FormLabel>
                              <p className="text-sm text-muted-foreground">Vital signs monitoring</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isAccessible"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between p-4 border-2 border-medical-purple/20 rounded-xl bg-medical-purple-light/20">
                            <div>
                              <FormLabel className="text-medical-purple font-semibold">Wheelchair Accessible</FormLabel>
                              <p className="text-sm text-muted-foreground">ADA compliant access</p>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Checkbox Features */}
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-medical-orange font-semibold text-base">Additional Features</FormLabel>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-3">
                            {roomFeatures.map((feature) => (
                              <div key={feature} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                                <Checkbox
                                  id={feature}
                                  checked={field.value?.includes(feature) || false}
                                  onCheckedChange={(checked) => {
                                    const currentFeatures = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentFeatures, feature]);
                                    } else {
                                      field.onChange(currentFeatures.filter(f => f !== feature));
                                    }
                                  }}
                                />
                                <Label htmlFor={feature} className="text-sm cursor-pointer">
                                  {feature}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-medical-red font-semibold">Description & Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="Additional information about the room..."
                              className="border-2 border-medical-red/20 focus:border-medical-red rounded-xl bg-medical-red-light/30 min-h-[100px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-2 hover:bg-muted"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="btn-primary px-8"
                  >
                    {selectedRoom ? 'Update Room' : 'Create Room'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="stat-card border-l-4 border-l-medical-blue">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-medical-blue">Total Rooms</p>
              <p className="text-3xl font-bold text-foreground">{totalRooms}</p>
            </div>
            <Bed className="h-8 w-8 text-medical-blue" />
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-success">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-success">Available</p>
              <p className="text-3xl font-bold text-foreground">{availableRooms}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-destructive">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-destructive">Occupied</p>
              <p className="text-3xl font-bold text-foreground">{occupiedRooms}</p>
            </div>
            <XCircle className="h-8 w-8 text-destructive" />
          </CardContent>
        </Card>

        <Card className="stat-card border-l-4 border-l-warning">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-warning">Maintenance</p>
              <p className="text-3xl font-bold text-foreground">{maintenanceRooms}</p>
            </div>
            <Clock className="h-8 w-8 text-warning" />
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="card-gradient">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by room number or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 focus:border-primary rounded-xl"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px] border-2 focus:border-primary rounded-xl">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Pediatric">Pediatric</SelectItem>
                  <SelectItem value="Maternity">Maternity</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px] border-2 focus:border-primary rounded-xl">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <DataTable
        title="Room Management"
        columns={columns}
        data={filteredRooms}
        searchable={false}
        onEdit={handleEdit}
        onDelete={(room) => handleDelete(room.id)}
        onAdd={() => {
          setSelectedRoom(null);
          form.reset();
          setIsDialogOpen(true);
        }}
        addButtonText="Add Room"
      />
    </div>
  );
};

export default RoomManagement;