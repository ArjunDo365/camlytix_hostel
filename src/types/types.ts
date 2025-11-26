import { ReactNode } from "react";

export interface Section {
  floor_name: ReactNode;
  block_name: ReactNode;
  id: number;
  name: string;
  floor_id: number;
  description: string;
  display_order: number;
}

export interface Floor {
  block_name: ReactNode;
  id: number;
  name: string;
  block_id: number;
  description: string;
  display_order?: number;
}

export interface Block {
  id: number;
  name: string;
  description: string;
  display_order: number;
}

export interface Nvr {
  floor_name: ReactNode;
  location_name: ReactNode;
  block_name: ReactNode;
  id: number;
  location_id: number;
  asset_no: string;
  serial_number: string;
  model_name: string;
  ip_address: string;
  manufacturer: string;
  vendor: string;
  install_date: string;
  last_working_on?:string;
  is_working?:any;
  status?:number;
}

export interface Camera {
  location_name: ReactNode;
  floor_name: ReactNode;
  block_name: ReactNode;
  id: number;
  location_id: number;
  nvr_id:number;
  asset_no: string;
  serial_number: string;
  model_name: string;
  ip_address: string;
  port:number;
  manufacturer: string;
  vendor: string;
  install_date: string;
  last_working_on?:string;
  is_working?:any;
  status:number
}

export interface AppSetting {
  id: number;
  keyname: string;
  keyvalue: string;
  // display_order: number;
}