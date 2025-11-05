import React, { useState } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Clock, AlertTriangle, Calendar, Pill, TestTube, Info } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

const NotificationCenter: React.FC = () => {
  const {
    notifications,
    reminders,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    dismissReminder,
  } = useNotifications();

  const [open, setOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'medication':
        return <Pill className="w-4 h-4" />;
      case 'lab_result':
        return <TestTube className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-destructive/10 text-destructive border-destructive';
      case 'high':
        return 'bg-medical-orange/10 text-medical-orange border-medical-orange';
      case 'normal':
        return 'bg-primary/10 text-primary border-primary';
      case 'low':
        return 'bg-muted/10 text-muted-foreground border-muted';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'bg-medical-blue/10 text-medical-blue border-medical-blue';
      case 'medication':
        return 'bg-medical-green/10 text-medical-green border-medical-green';
      case 'lab_result':
        return 'bg-medical-purple/10 text-medical-purple border-medical-purple';
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted';
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications & Reminders</span>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="w-4 h-4 mr-1" />
                Mark all read
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            Stay updated with your appointments, medications, and system alerts
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="notifications" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reminders" className="relative">
              Reminders
              {reminders.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {reminders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No notifications yet</p>
                  <p className="text-sm text-muted-foreground">We'll notify you when something important happens</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <Card 
                      key={notification.id} 
                      className={`transition-all hover:shadow-md ${
                        !notification.read ? 'border-l-4 border-l-primary bg-primary/5' : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTypeColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-sm text-foreground">
                                  {notification.title}
                                </h4>
                                <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                                  {notification.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {notification.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reminders" className="mt-4">
            <ScrollArea className="h-[600px] pr-4">
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading reminders...</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No active reminders</p>
                  <p className="text-sm text-muted-foreground">Create reminders to stay on track</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reminders.map((reminder) => (
                    <Card key={reminder.id} className="hover:shadow-md transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                              <Clock className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-foreground mb-1">
                                {reminder.title}
                              </h4>
                              {reminder.description && (
                                <p className="text-sm text-muted-foreground mb-2">
                                  {reminder.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(reminder.reminder_time).toLocaleString()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {reminder.reminder_type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => dismissReminder(reminder.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
