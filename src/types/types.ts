import { ReactNode } from "react";

export interface Section {
  floor_name: ReactNode;
  block_name: ReactNode;
  id: string;
  name: string;
  floor_id: string;
  description: string;
  display_order: number;
}

export interface Floor {
  block_name: ReactNode;
  id: string;
  name: string;
  block_id: string;
  description: string;
  display_order?: number;
}

export interface Block {
  id: string;
  name: string;
  description: string;
  display_order: number;
}

export interface Nvr {
  floor_name: ReactNode;
  location_name: ReactNode;
  block_name: ReactNode;
  id: string;
  section_id: string;
  asset_no: string;
  serial_number: string;
  model_name: string;
  ip_address: string;
  manufacturer: string;
  vendor: string;
  install_date: string;
  last_working_on?: string;
  is_working?: any;
  status?: number;
}

export interface Camera {
  location_name: ReactNode;
  floor_name: ReactNode;
  block_name: ReactNode;
  id: string;
  section_id: string;
  nvr_id: string;
  asset_no: string;
  serial_number: string;
  model_name: string;
  ip_address: string;
  port: number;
  manufacturer: string;
  vendor: string;
  install_date: string;
  last_working_on?: string;
  is_working?: any;
  status: number;
}

export interface AppSetting {
  id: string;
  keyname: string;
  keyvalue: string;
  // display_order: number;
}

export interface Student {
  id: string;
  name: string;
  gender: string;
  register_number: string;
  mobile_number: string;
  email: string;
  room_no: string;
  student_image: string;
  degree: string;
  branch: string;
  display_order: number;
}
