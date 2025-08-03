import { useState } from "react";

export interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  status: "online" | "offline" | "sos";
  location: string;
  battery: number;
  lastSeen: string;
  lat: number;
  lng: number;
  phone: string;
}

export interface Geofence {
  id: string;
  name: string;
  address: string;
  type: "home" | "school" | "work" | "custom";
  radius: number;
  isActive: boolean;
  notifications: boolean;
  lat: number;
  lng: number;
}

export function useMockData() {
  const [familyMembers] = useState<FamilyMember[]>([
    {
      id: "1",
      name: "Mummy",
      status: "online",
      location: "Kathmandu, Nepal",
      battery: 85,
      lastSeen: "2 min ago",
      lat: 27.7172,
      lng: 85.3240,
      phone: "+977-9841234567"
    },
    {
      id: "2", 
      name: "Papa",
      status: "online",
      location: "Bhaktapur, Nepal",
      battery: 67,
      lastSeen: "5 min ago",
      lat: 27.6710,
      lng: 85.4298,
      phone: "+977-9851234567"
    },
    {
      id: "3",
      name: "Sister",
      status: "offline",
      location: "Lalitpur, Nepal", 
      battery: 23,
      lastSeen: "1 hour ago",
      lat: 27.6588,
      lng: 85.3247,
      phone: "+977-9861234567"
    },
    {
      id: "4",
      name: "Brother",
      status: "sos",
      location: "Pokhara, Nepal",
      battery: 45,
      lastSeen: "Just now",
      lat: 28.2096,
      lng: 83.9856,
      phone: "+977-9871234567"
    }
  ]);

  const [geofences] = useState<Geofence[]>([
    {
      id: "1",
      name: "Home",
      address: "Kathmandu-32, Bagbazar, Nepal",
      type: "home",
      radius: 200,
      isActive: true,
      notifications: true,
      lat: 27.7172,
      lng: 85.3240
    },
    {
      id: "2",
      name: "School", 
      address: "DAV School, Jawalakhel, Lalitpur",
      type: "school",
      radius: 150,
      isActive: true,
      notifications: true,
      lat: 27.6588,
      lng: 85.3247
    },
    {
      id: "3",
      name: "Office",
      address: "New Baneshwor, Kathmandu",
      type: "work",
      radius: 100,
      isActive: false,
      notifications: false,
      lat: 27.6934,
      lng: 85.3467
    }
  ]);

  const [alerts] = useState([
    {
      id: "1",
      type: "geofence",
      message: "Sister has arrived at School",
      timestamp: "10:30 AM",
      member: "Sister",
      isRead: false
    },
    {
      id: "2", 
      type: "sos",
      message: "Brother sent an SOS alert",
      timestamp: "2:15 PM",
      member: "Brother",
      isRead: false
    },
    {
      id: "3",
      type: "battery",
      message: "Sister's phone battery is low (23%)",
      timestamp: "1:45 PM", 
      member: "Sister",
      isRead: true
    }
  ]);

  return {
    familyMembers,
    geofences,
    alerts
  };
}